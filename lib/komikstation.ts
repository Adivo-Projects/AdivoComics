import type {
  HomeFeed,
  LatestItem,
  SeriesCard,
  PopularItem,
  SeriesDetail,
  ChapterData,
  ListingResponse,
  Genre,
} from '@/lib/types';

// Load the underlying Komikstation scraper. The actual scraping logic runs in
// a CommonJS module which relies on `child_process` and `curl` to fetch HTML.
// Because of that, this wrapper must only execute on the server. It is not
// safe to call any of these functions from the client. Doing so will
// throw at runtime. Use in server actions or route handlers only.

let ks: any;
async function load() {
  if (!ks) {
    // Dynamic import to avoid bundling at build time.
    ks = await import('./komikstation-source.js');
  }
  return ks.komikstation;
}

function ensureServer() {
  if (typeof window !== 'undefined') {
    throw new Error('Komikstation API must be called server-side');
  }
}

export async function getHome(): Promise<HomeFeed> {
  ensureServer();
  const m = await load();
  const res = await m.getHome();
  if (!res.status) throw new Error(res.message || 'Failed to fetch home');
  return res.data as HomeFeed;
}

export async function getLatest(page?: number, type?: string): Promise<ListingResponse<LatestItem>> {
  ensureServer();
  const m = await load();
  const res = await m.getLatest(page, type);
  if (!res.status) throw new Error(res.message || 'Failed to fetch latest');
  return res.data as ListingResponse<LatestItem>;
}

export async function getPopular(page?: number, type?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getPopular(page, type);
  if (!res.status) throw new Error(res.message || 'Failed to fetch popular');
  return res.data as ListingResponse<SeriesCard>;
}

export async function getCompleted(page?: number, type?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getCompleted(page, type);
  if (!res.status) throw new Error(res.message || 'Failed to fetch completed');
  return res.data as ListingResponse<SeriesCard>;
}

export async function search(query: string, page?: number, type?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.search(query, page, type);
  if (!res.status) throw new Error(res.message || 'Failed to search');
  return res.data as ListingResponse<SeriesCard>;
}

export async function getDetail(slugOrUrl: string): Promise<SeriesDetail> {
  ensureServer();
  const m = await load();
  const res = await m.getDetail(slugOrUrl);
  if (!res.status) throw new Error(res.message || 'Failed to fetch detail');
  return res.data as SeriesDetail;
}

export async function getChapter(slugOrUrl: string): Promise<ChapterData> {
  ensureServer();
  const m = await load();
  const res = await m.getChapter(slugOrUrl);
  if (!res.status) throw new Error(res.message || 'Failed to fetch chapter');
  return res.data as ChapterData;
}

export async function getGenres(): Promise<Genre[]> {
  ensureServer();
  const m = await load();
  const res = await m.getGenres();
  if (!res.status) throw new Error(res.message || 'Failed to fetch genres');
  return res.data as Genre[];
}

export async function getByGenre(genre: string, page?: number, type?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getByGenre(genre, page, type);
  if (!res.status) throw new Error(res.message || 'Failed to fetch by genre');
  return res.data as ListingResponse<SeriesCard>;
}

export async function getByType(type: string, page?: number, order?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getByType(type, page, order);
  if (!res.status) throw new Error(res.message || 'Failed to fetch by type');
  return res.data as ListingResponse<SeriesCard>;
}

export async function getAZList(letter: string, type?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getAZList(letter, type);
  if (!res.status) throw new Error(res.message || 'Failed to fetch A-Z list');
  return res.data as ListingResponse<SeriesCard>;
}

export async function getProjectList(page?: number, type?: string): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getProjectList(page, type);
  if (!res.status) throw new Error(res.message || 'Failed to fetch project list');
  return res.data as ListingResponse<SeriesCard>;
}

export async function getLibrary(opts: Record<string, unknown>): Promise<ListingResponse<SeriesCard>> {
  ensureServer();
  const m = await load();
  const res = await m.getLibrary(opts);
  if (!res.status) throw new Error(res.message || 'Failed to fetch library');
  return res.data as ListingResponse<SeriesCard>;
}