// Domain models used throughout the app. These models normalize the raw
// scraper responses from komikstation.js into well typed objects that
// the UI can rely on without dealing with missing or inconsistent fields.

export interface Pagination {
  currentPage: number;
  hasNext: boolean;
  totalPages: number;
  pages: number[];
}

export interface SeriesCard {
  title: string;
  slug: string;
  url: string;
  thumbnail?: string;
  type?: string;
  latestChapter?: string;
  rating?: string;
  ratingPct?: string;
  status?: string;
}

export interface LatestItem extends SeriesCard {
  chapters: {
    title: string;
    url: string;
    date?: string;
  }[];
}

export interface PopularItem extends SeriesCard {
  rank?: number;
  genres?: string[];
}

export interface HomeFeed {
  trending: SeriesCard[];
  projectList: SeriesCard[];
  latest: LatestItem[];
  popular: {
    weekly: PopularItem[];
    monthly: PopularItem[];
    alltime: PopularItem[];
  };
  recommendations?: {
    tab: string;
    tabId: string;
    items: SeriesCard[];
  }[];
}

export interface SeriesDetail {
  title: string;
  slug: string;
  url: string;
  cover?: string;
  type?: string;
  alternativeTitles: string[];
  synopsis: string;
  genres: { name: string; slug: string; url: string }[];
  author?: string;
  illustrator?: string;
  releaseYear?: string;
  edition?: string;
  lastRelease?: string;
  status?: string;
  rating?: string;
  ratingPct?: string;
  ratingCount?: string;
  followers?: string;
  chapters: {
    chapter: string;
    number?: string;
    url: string;
    date?: string;
    download?: string;
  }[];
  totalChapters?: number;
  firstChapter?: string;
  firstChapterUrl?: string;
  lastChapter?: string;
  lastChapterUrl?: string;
  recommendations?: SeriesCard[];
}

export interface ChapterData {
  title: string;
  slug: string;
  url: string;
  series: { title: string; url: string };
  breadcrumb: { title: string; url: string }[];
  images: string[];
  imageCount?: number;
  prevChapter?: string;
  nextChapter?: string;
  download?: string;
  source?: string;
}

export interface Genre {
  name: string;
  slug: string;
  url: string;
}

// Response wrappers used by the service layer
export interface ListingResponse<T> {
  items: T[];
  pagination: Pagination;
  type?: string;
  genre?: string;
  letter?: string;
  filters?: Record<string, unknown>;
}