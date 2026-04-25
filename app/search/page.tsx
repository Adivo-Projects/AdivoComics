import { search as searchSeries } from '@/lib/komikstation';
import SeriesCard from '@/components/SeriesCard';

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const revalidate = 60 * 2;

export default async function SearchPage({ searchParams }: Props) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  const page = searchParams.page ? parseInt(searchParams.page as string) : undefined;
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  let data;
  if (query) {
    data = await searchSeries(query, page, type);
  }
  return (
    <div className="px-4 pt-4 space-y-6">
      <h1 className="text-xl font-bold">Search</h1>
      <form method="get" action="/search" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search..."
          className="flex-1 px-3 py-2 bg-surface border border-neutral-700 rounded text-sm outline-none focus:border-primary-dark"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-background rounded text-sm font-semibold hover:bg-primary-dark"
        >
          Go
        </button>
      </form>
      {query && (
        <>
          {!data?.items.length ? (
            <p className="text-muted text-sm">No results found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {data.items.map((item) => (
                <SeriesCard key={item.slug} item={item} />
              ))}
            </div>
          )}
          {data && (
            <div className="flex justify-center space-x-4 py-4">
              {data.pagination.currentPage > 1 && (
                <a
                  href={`?${new URLSearchParams({ q: query, ...(type && { type }), page: (data.pagination.currentPage - 1).toString() }).toString()}`}
                  className="px-3 py-1 bg-surface border border-neutral-700 rounded text-sm hover:bg-neutral-800"
                >
                  Previous
                </a>
              )}
              {data.pagination.hasNext && (
                <a
                  href={`?${new URLSearchParams({ q: query, ...(type && { type }), page: (data.pagination.currentPage + 1).toString() }).toString()}`}
                  className="px-3 py-1 bg-surface border border-neutral-700 rounded text-sm hover:bg-neutral-800"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
