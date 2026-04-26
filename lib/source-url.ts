const SOURCE_BASE = 'https://komikstation.org';

export function cleanSlug(value: string): string {
  return value
    .replace(/^https?:\/\/komikstation\.org\/?/i, '')
    .replace(/^manga\//i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')
    .trim();
}

export function getSeriesSlugFromUrl(urlOrSlug: string): string {
  return cleanSlug(urlOrSlug);
}

export function getChapterSlugFromUrl(urlOrSlug: string): string {
  return cleanSlug(urlOrSlug);
}

export function toSeriesHref(slugOrUrl: string): string {
  return `/series/${encodeURIComponent(getSeriesSlugFromUrl(slugOrUrl))}`;
}

export function toChapterHref(chapterUrlOrSlug: string, seriesSlugOrUrl: string): string {
  const seriesSlug = getSeriesSlugFromUrl(seriesSlugOrUrl);
  const chapterSlug = getChapterSlugFromUrl(chapterUrlOrSlug);
  return `/series/${encodeURIComponent(seriesSlug)}/chapters/${encodeURIComponent(chapterSlug)}`;
}

export function toSourceChapterUrl(chapterSlugOrUrl: string): string {
  if (/^https?:\/\//i.test(chapterSlugOrUrl)) return chapterSlugOrUrl;
  return `${SOURCE_BASE}/${getChapterSlugFromUrl(chapterSlugOrUrl)}/`;
}
