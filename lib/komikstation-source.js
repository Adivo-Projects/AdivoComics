/*
 * This file is imported from the provided komikstation.js. It contains
 * the scraping logic used by the content source. We preserve the
 * implementation largely as provided to minimize divergence from the
 * official adapter. In production this logic should run exclusively
 * server‑side via server actions or API routes to avoid exposing
 * scraping logic to the client and to maintain a controlled request
 * discipline as required by the specification.
 */

const { execSync } = require("child_process");
const cheerio = require("cheerio");

const BASE = "https://komikstation.org";

function FETCH(url) {
  try {
    const html = execSync(
      `curl -s -L --max-time 15 -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36" "${url}"`,
      { maxBuffer: 10 * 1024 * 1024, encoding: "utf8" }
    );
    if (!html || html.length < 500 || html.includes("Just a moment")) {
      return { html: null, error: "blocked or empty response" };
    }
    return { html };
  } catch (e) {
    return { html: null, error: e.message };
  }
}

const komikstation = {
  slug(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  },
  card($, el) {
    const a = el.find("a").first();
    const imgs = el.find("img");
    let thumb = "", type = "";
    imgs.each(function () {
      const s = $(this).attr("data-src") || "";
      const realSrc = (!s || s.startsWith("data:")) ? ($(this).parent().next("noscript").find("img").attr("src") || "") : s;
      if (realSrc && !realSrc.includes("/flags/")) thumb = realSrc;
      if (!type && s.includes("/flags/")) type = $(this).attr("alt") || "";
      if ($(this).closest(".type").length) type = $(this).attr("alt") || $(this).attr("title") || "";
    });
    if (!thumb) {
      imgs.each(function () {
        const s = $(this).attr("src") || "";
        if (s && !s.startsWith("data:") && !s.includes("/flags/") && !s.includes("svg")) thumb = s;
      });
    }
    const typeEl = el.find(".type").first();
    if (typeEl.length) {
      type = typeEl.attr("title") || type;
      if (!type) {
        const cls = typeEl.attr("class") || "";
        if (cls.includes("Manhwa")) type = "Manhwa";
        else if (cls.includes("Manhua")) type = "Manhua";
        else if (cls.includes("Manga")) type = "Manga";
      }
    }
    type = type.replace(/\s*\(.*?\)\s*/, "").trim();
    const tt = el.find(".tt").text().trim();
    const epxs = el.find(".epxs").text().trim();
    const score = el.find(".numscore").text().trim();
    const rtbStyle = el.find(".rtb span").attr("style") || "";
    const ratingPct = rtbStyle.match(/width:\s*(\d+)%/);
    const statusEl = el.find(".status");
    const status = statusEl.length ? statusEl.text().trim() : "";
    const title = a.attr("title") || tt;
    const url = a.attr("href") || "";
    return {
      title,
      slug: url.replace(BASE + "/manga/", "").replace(/\/$/, ""),
      url,
      thumbnail: thumb,
      type: type || undefined,
      latestChapter: epxs || undefined,
      rating: score || undefined,
      ratingPct: ratingPct ? ratingPct[1] : undefined,
      status: status || undefined
    };
  },
  cards($, container) {
    const items = [];
    $(container).find(".bs .bsx").each(function () {
      const c = komikstation.card($, $(this));
      if (c.title && c.url) items.push(c);
    });
    return items;
  },
  latestCard($, el) {
    const imgu = el.find(".imgu a.series");
    const titleEl = el.find("h3, h4").first();
    const title = titleEl.text().trim() || imgu.attr("title") || "";
    const url = imgu.attr("href") || el.find("a.series").attr("href") || "";
    const imgs = el.find(".imgu img");
    let thumb = "";
    imgs.each(function () {
      const s = $(this).attr("data-src") || "";
      const realSrc = (!s || s.startsWith("data:")) ? ($(this).parent().next("noscript").find("img").attr("src") || "") : s;
      if (realSrc) thumb = realSrc;
    });
    if (!thumb) {
      imgs.each(function () {
        const s = $(this).attr("src") || "";
        if (s && !s.startsWith("data:") && !s.includes("/flags/")) thumb = s;
      });
    }
    const ulClass = el.find(".luf ul").attr("class") || "";
    let type = "";
    if (ulClass.includes("Manhwa")) type = "Manhwa";
    else if (ulClass.includes("Manhua")) type = "Manhua";
    else if (ulClass.includes("Manga")) type = "Manga";
    const chapters = [];
    el.find(".luf ul li").each(function () {
      const chA = $(this).find("a");
      const chUrl = chA.attr("href") || "";
      const chTitle = chA.text().trim();
      const chDate = $(this).find("span").text().trim();
      if (chUrl && chTitle) chapters.push({ title: chTitle, url: chUrl, date: chDate });
    });
    return {
      title,
      slug: url.replace(BASE + "/manga/", "").replace(/\/$/, ""),
      url,
      thumbnail: thumb,
      type: type || undefined,
      chapters
    };
  },
  pages($) {
    const pnums = [];
    let cur = 1,
      next = false,
      total = 1;
    $(".page-numbers").each(function () {
      const href = $(this).attr("href") || "";
      const text = $(this).text().trim();
      if ($(this).hasClass("current")) cur = parseInt(text) || 1;
      else if ($(this).hasClass("next")) next = true;
      else {
        const m = href.match(/page\/(\d+)/);
        if (m) {
          const p = parseInt(m[1]);
          if (p > total) total = p;
          pnums.push(p);
        }
      }
    });
    pnums.sort((a, b) => a - b);
    return {
      currentPage: cur,
      hasNext: next,
      totalPages: total,
      pages: [...new Set(pnums)]
    };
  },
  libUrl(params) {
    const parts = [];
    if (params.type) parts.push(`type=${encodeURIComponent(params.type)}`);
    if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
    if (params.order) parts.push(`order=${encodeURIComponent(params.order)}`);
    if (params.title) parts.push(`title=${encodeURIComponent(params.title)}`);
    if (params.author) parts.push(`author=${encodeURIComponent(params.author)}`);
    if (params.year) parts.push(`yearx=${encodeURIComponent(params.year)}`);
    if (params.genres && Array.isArray(params.genres)) {
      params.genres.forEach((g) => parts.push(`genre[]=${encodeURIComponent(g)}`));
    }
    if (params.page && params.page > 1) parts.push(`page=${params.page}`);
    return `${BASE}/manga/${parts.length ? "?" + parts.join("&") : ""}`;
  },
  async getHome() {
    const r = FETCH(BASE + "/");
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    const trending = [];
    $(".hothome .bs .bsx").each(function () {
      trending.push(komikstation.card($, $(this)));
    });
    const projectList = [];
    $(".project-home .bs .bsx").each(function () {
      projectList.push(komikstation.card($, $(this)));
    });
    const latest = [];
    const latestSection = $(".bixbox").not(".hothome").not(".project-home").first();
    if (latestSection.length) {
      latestSection.find(".listupd .utao").each(function () {
        latest.push(komikstation.latestCard($, $(this)));
      });
    }
    const popular = { weekly: [], monthly: [], alltime: [] };
    ["weekly", "monthly", "alltime"].forEach((range) => {
      $(`.wpop-${range} li`).each(function () {
        const rank = $(this).find(".ctr").text().trim();
        const a = $(this).find(".leftseries a.series").first();
        const title = a.text().trim() || a.attr("title") || "";
        const url = a.attr("href") || "";
        let thumb = "";
        const img = $(this).find(".imgseries img");
        const dsrc = img.attr("data-src") || "";
        const noscript = $(this).find(".imgseries noscript img");
        if (dsrc && !dsrc.startsWith("data:")) thumb = dsrc;
        else if (noscript.length) thumb = noscript.attr("src") || "";
        const score = $(this).find(".numscore").text().trim();
        const genres = [];
        $(this)
          .find(".leftseries span a")
          .each(function () {
            const name = $(this).text().trim();
            if (name) genres.push(name);
          });
        if (title && url) {
          popular[range].push({
            rank: parseInt(rank) || undefined,
            title,
            slug: url.replace(BASE + "/manga/", "").replace(/\/$/, ""),
            url,
            thumbnail: thumb || undefined,
            rating: score || undefined,
            genres: genres.length ? genres : undefined,
          });
        }
      });
    });
    const recommendations = [];
    const tabNav = $(".series-gen .nav-tabs li a");
    tabNav.each(function () {
      const href = $(this).attr("href") || "";
      const tabId = href.replace("#", "");
      const label = $(this).text().trim();
      const items = [];
      $(`#${tabId} .bsx`).each(function () {
        const c = komikstation.card($, $(this));
        if (c.title && c.url) items.push(c);
      });
      if (label) recommendations.push({ tab: label, tabId, items });
    });
    return {
      status: true,
      data: {
        trending,
        projectList,
        latest,
        popular,
        recommendations,
      },
    };
  },
  async getLatest(page, type) {
    const p = page || 1;
    const url = p > 1 ? `${BASE}/page/${p}/` : BASE + "/";
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = [];
    $(".listupd .utao").each(function () {
      items.push(komikstation.latestCard($, $(this)));
    });
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { items, pagination: komikstation.pages($) };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async getPopular(page, type) {
    const p = page || 1;
    const url = komikstation.libUrl({ order: "popular", page: p });
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = komikstation.cards($, ".postbody");
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { items, pagination: komikstation.pages($) };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async getCompleted(page, type) {
    const p = page || 1;
    const url = komikstation.libUrl({ status: "completed", order: "title", page: p });
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = komikstation.cards($, ".postbody");
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { items, pagination: komikstation.pages($) };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async search(query, page, type) {
    const p = page || 1;
    let url = `${BASE}/?s=${encodeURIComponent(query)}`;
    if (p > 1) url += `&paged=${p}`;
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = komikstation.cards($, ".postbody");
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { items, pagination: komikstation.pages($) };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async getDetail(input) {
    let url = input;
    if (!input.startsWith("http")) url = `${BASE}/manga/${komikstation.slug(input)}/`;
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    const rawTitle = $(".infox .entry-title").text().replace(/[\n\r]/g, " ").replace(/\s+/g, " ").trim();
    const title = rawTitle.replace(/\s*(Bahasa Indonesia)$/i, "").trim();
    const infox = $(".infox");
    let altTitles = [];
    infox.find(".wd-full").each(function () {
      const b = $(this).find("b").text().trim().toLowerCase();
      if (b.includes("judul alternatif") || b.includes("alternatif")) {
        altTitles = $(this)
          .find("> span")
          .text()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    });
    let synopsis = "";
    infox.find(".wd-full").each(function () {
      if (
        $(this)
          .find("h2, b")
          .text()
          .trim()
          .toLowerCase()
          .includes("sinopsis")
      ) {
        synopsis = $(this).find(".entry-content, .entry-content-single").text().trim();
      }
    });
    const genres = [];
    infox.find(".mgen a").each(function () {
      const name = $(this).text().trim();
      const href = $(this).attr("href") || "";
      const slug = href.replace(BASE + "/genres/", "").replace(/\/$/, "");
      if (name) genres.push({ name, slug, url: href });
    });
    let author = "",
      illustrator = "",
      releaseYear = "",
      edition = "",
      lastRelease = "",
      status = "";
    infox.find(".fmed").each(function () {
      const b = $(this).find("b").text().trim().toLowerCase();
      const val = $(this).find("span").text().trim();
      if (b.includes("penulis") || b.includes("author")) author = val;
      if (b.includes("ilustrator")) illustrator = val;
      if (b.includes("rilisan terakhir") || b.includes("last release")) {
        lastRelease = $(this).find("time").attr("datetime") || val;
      } else if (b.includes("terbitan")) {
        releaseYear = val;
      }
      if (b.includes("edisi")) edition = val;
    });
    const imptdt = $(".imptdt");
    if (imptdt.length && !status) status = imptdt.find("i").text().trim();
    let cover = $(".thumbook .thumb img, .bigcontent .thumb img").attr("src") || "";
    if (cover.startsWith("data:")) cover = $(".thumbook noscript img").attr("src") || "";
    let rating = "",
      ratingPct = "",
      ratingCount = "";
    const ratingPrc = $(".rating-prc").first();
    if (ratingPrc.length) {
      rating = ratingPrc.find(".num").text().trim();
      const m = ratingPrc.find(".rtb span").attr("style")?.match(/width:\s*(\d+)%/);
      ratingPct = m ? m[1] : "";
      ratingCount = ratingPrc.find('[itemprop="ratingCount"]').attr("content") || "";
    }
    let followers = "";
    const fm = $(".bmc").text().match(/(\d[\d\s.]*)\s*orang/);
    if (fm) followers = fm[1].replace(/\s/g, "");
    const chapters = [];
    $("#chapterlist li, .eplister li").each(function () {
      const num = $(this).attr("data-num") || "";
      const chTitle =
        $(this).find(".chapternum").text().trim() || $(this).find(".eph-num a").text().trim();
      const chUrl = $(this).find(".eph-num a, a[href*="chapter"]").attr("href") || "";
      const chDate = $(this).find(".chapterdate").text().trim();
      const dlUrl = $(this).find(".dload, .dlxx").attr("href") || "";
      if (chUrl) chapters.push({ chapter: chTitle, number: num, url: chUrl, date: chDate || undefined, download: dlUrl || undefined });
    });
    let type = "";
    $(".tsinfo .imptdt").each(function () {
      if ($(this).text().includes("Tipe") && !type) {
        type = $(this).find("a").text().trim();
      }
    });
    if (!type) {
      const firstType = $(".thumbook .type, .bigcontent .type").first();
      if (firstType.length) {
        type = firstType.attr("title") || "";
        if (!type) {
          const cls = firstType.attr("class") || "";
          if (cls.includes("Manhwa")) type = "Manhwa";
          else if (cls.includes("Manhua")) type = "Manhua";
          else if (cls.includes("Manga")) type = "Manga";
        }
      }
    }
    type = type.replace(/\s*\(.*?\)\s*/, "").trim();
    const lastChText = $(".epcurlast").text().trim();
    const lastChUrl = $(".epcurlast").closest("a").attr("href") || "";
    let firstChapter,
      firstChapterUrl;
    const firstChText = $(".epcurfirst").text().trim();
    const firstChLink = $(".epcurfirst").closest("a");
    if (firstChLink.length && !firstChLink.attr("href")?.includes("#")) {
      firstChapter = firstChText;
      firstChapterUrl = firstChLink.attr("href") || "";
    }
    if (!firstChapter || firstChapter === "Chapter ?") {
      if (chapters.length) {
        const last = chapters[chapters.length - 1];
        firstChapter = last.chapter;
        firstChapterUrl = last.url;
      }
    }
    const recommendations = [];
    $("h2, h3").each(function () {
      if ($(this).text().trim().includes("Yang Nggak Kalah Seru")) {
        const bixbox = $(this).closest(".bixbox");
        if (bixbox.length) {
          bixbox.find(".bs .bsx").each(function () {
            const c = komikstation.card($, $(this));
            if (c.title && c.url) recommendations.push(c);
          });
        }
        return false;
      }
    });
    const slug = url.replace(BASE + "/manga/", "").replace(/\/$/, "");
    return {
      status: true,
      data: {
        title,
        slug,
        url,
        cover,
        type: type || undefined,
        alternativeTitles: altTitles,
        synopsis,
        genres,
        author: author || undefined,
        illustrator: illustrator || undefined,
        releaseYear: releaseYear || undefined,
        edition: edition || undefined,
        lastRelease: lastRelease || undefined,
        status: status || undefined,
        rating: rating || undefined,
        ratingPct: ratingPct || undefined,
        ratingCount: ratingCount || undefined,
        followers: followers || undefined,
        chapters,
        totalChapters: chapters.length || undefined,
        firstChapter: firstChapter || undefined,
        firstChapterUrl: firstChapterUrl || undefined,
        lastChapter: lastChText || undefined,
        lastChapterUrl: lastChUrl || undefined,
        recommendations: recommendations.length ? recommendations : undefined,
      },
    };
  },
  async getChapter(input) {
    let url = input;
    if (!input.startsWith("http")) url = `${BASE}/${komikstation.slug(input)}/`;
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    const title = $(".headpost .entry-title, .headpost h1").text().trim();
    const images = [];
    let tsConfig = null;
    const m = r.html.match(/ts_reader\.run\(({[\s\S]*?})\);/);
    if (m) {
      try {
        const raw = m[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&#039;/g, "'")
          .replace(/&nbsp;/g, ' ');
        tsConfig = JSON.parse(raw);
      } catch (e) {
        tsConfig = null;
      }
    }
    if (tsConfig && tsConfig.sources && tsConfig.sources[0]) {
      const src = tsConfig.sources[0];
      const srcImages = src.images || [];
      for (const img of srcImages) {
        if (img && !img.startsWith("data:")) images.push(img);
      }
    }
    if (!images.length) {
      $("#readerarea img").each(function () {
        const src = $(this).attr("data-src") || $(this).attr("src") || "";
        if (src && !src.startsWith("data:")) images.push(src);
      });
    }
    if (!images.length) {
      $("#readerarea noscript img").each(function () {
        const src = $(this).attr("src") || "";
        if (src && !src.startsWith("data:")) images.push(src);
      });
    }
    let seriesUrl = "",
      seriesTitle = "";
    const allc = $(".allc a");
    if (allc.length) {
      seriesUrl = allc.attr("href") || "";
      seriesTitle = allc.text().trim();
    }
    const breadcrumb = [];
    $(".ts-breadcrumb a, .breadcrumb a").each(function () {
      breadcrumb.push({ title: $(this).text().trim(), url: $(this).attr("href") || "" });
    });
    let prevChapter = "",
      nextChapter = "";
    if (tsConfig) {
      if (tsConfig.prevUrl) prevChapter = tsConfig.prevUrl;
      if (tsConfig.nextUrl) nextChapter = tsConfig.nextUrl;
    }
    if (!prevChapter) {
      $(".ch-prev-btn, a[rel='prev']").each(function () {
        const h = $(this).attr("href") || "";
        if (h && !h.startsWith("#")) prevChapter = h;
      });
    }
    if (!nextChapter) {
      $(".ch-next-btn, a[rel='next']").each(function () {
        const h = $(this).attr("href") || "";
        if (h && !h.startsWith("#")) nextChapter = h;
      });
    }
    let download = "";
    const dlEl = $(".dlx a");
    if (dlEl.length) {
      const h = dlEl.attr("href") || "";
      if (h && !h.startsWith("#")) download = h;
    }
    const sourceName = tsConfig?.sources?.[0]?.source || undefined;
    const slug = url.replace(BASE + "/", "").replace(/\/$/, "");
    return {
      status: true,
      data: {
        title,
        slug,
        url,
        series: { title: seriesTitle, url: seriesUrl },
        breadcrumb,
        images,
        imageCount: images.length || undefined,
        prevChapter: prevChapter || undefined,
        nextChapter: nextChapter || undefined,
        download: download || undefined,
        source: sourceName,
      },
    };
  },
  async getGenres() {
    const r = FETCH(BASE + "/manga/");
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    const genres = [];
    $("a[href*='/genres/']").each(function () {
      const href = $(this).attr("href") || "";
      const name = $(this).text().trim();
      const slug = href.replace(BASE + "/genres/", "").replace(/\/$/, "");
      if (name && slug && !genres.find((g) => g.slug === slug)) genres.push({ name, slug, url: href });
    });
    genres.sort((a, b) => a.name.localeCompare(b.name));
    return { status: true, data: genres };
  },
  async getByGenre(genre, page, type) {
    const p = page || 1;
    const gslug = komikstation.slug(genre);
    let url = `${BASE}/genres/${gslug}/`;
    if (p > 1) url += `page/${p}/`;
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = komikstation.cards($, ".postbody");
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { genre: gslug, items, pagination: komikstation.pages($) };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async getByType(type, page, order) {
    const t = komikstation.slug(type);
    const p = page || 1;
    const params = { type: t, page: p };
    if (order) params.order = order;
    const url = komikstation.libUrl(params);
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    return {
      status: true,
      data: { type: t, items: komikstation.cards($, ".postbody"), pagination: komikstation.pages($) },
    };
  },
  async getAZList(letter, type) {
    const show = letter || ".";
    const r = FETCH(`${BASE}/az-list/?show=${show}`);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = komikstation.cards($, ".postbody");
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { letter: show, items };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async getProjectList(page, type) {
    const p = page || 1;
    let url = `${BASE}/project-list/`;
    if (p > 1) url += `page/${p}/`;
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    let items = komikstation.cards($, ".postbody");
    if (type) items = items.filter((i) => i.type && i.type.toLowerCase() === type.toLowerCase());
    const result = { items, pagination: komikstation.pages($) };
    if (type) result.type = type;
    return { status: true, data: result };
  },
  async getLibrary(opts) {
    const o = opts || {};
    const url = komikstation.libUrl(o);
    const r = FETCH(url);
    if (!r.html) return { status: false, message: r.error || "failed to fetch" };
    const $ = cheerio.load(r.html);
    const filters = {};
    for (const [k, v] of Object.entries(o)) {
      if (v != null) filters[k] = v;
    }
    return {
      status: true,
      data: { items: komikstation.cards($, ".postbody"), pagination: komikstation.pages($), filters },
    };
  },
};

module.exports = { komikstation };