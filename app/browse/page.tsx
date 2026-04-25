import { getLibrary, getGenres } from '@/lib/komikstation';
import SeriesCard from '@/components/SeriesCard';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

export const revalidate = 60 * 10;

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BrowsePage({ searchParams }: Props) {
  const type = typeof searchParams.type === 'string' ? searchParams.type : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const order = typeof searchParams.order === 'string' ? searchParams.order : undefined;
  const page = searchParams.page ? parseInt(searchParams.page as string) : undefined;
  // Fetch library listing. This must run server-side.
  const data = await getLibrary({ type, status, order, page });
  // Provide genres for filter UI (could be used later)
  const genres = await getGenres();
  return (
    <div className="px-4 pt-4 space-y-6">
      <h1 className="text-xl font-bold">Browse</h1>
      {/* Filter summary */}
      <div className="text-xs text-muted flex flex-wrap gap-2">
        {type && <span>Type: {type}</span>}
        {status && <span>Status: {status}</span>}
        {order && <span>Order: {order}</span>}
      </div>
      {/* Listing grid */}
      <div className="grid grid-cols-2 gap-4">
        {data.items.map((item) => (
          <SeriesCard key={item.slug} item={item} />
        ))}
      </div>
      {/* Simple pagination */}
      <div className="flex justify-center space-x-4 py-4">
        {data.pagination.currentPage > 1 && (
          <a
            href={`?${new URLSearchParams({ ...(type && { type }), ...(status && { status }), ...(order && { order }), page: (data.pagination.currentPage - 1).toString() }).toString()}`}
            className="px-3 py-1 bg-surface border border-neutral-700 rounded text-sm hover:bg-neutral-800"
          >
            Previous
          </a>
        )}
        {data.pagination.hasNext && (
          <a
            href={`?${new URLSearchParams({ ...(type && { type }), ...(status && { status }), ...(order && { order }), page: (data.pagination.currentPage + 1).toString() }).toString()}`}
            className="px-3 py-1 bg-surface border border-neutral-700 rounded text-sm hover:bg-neutral-800"
          >
            Next
          </a>
        )}
      </div>
    </div>
  );
}
