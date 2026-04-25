import { getByType } from '@/lib/komikstation';
import SeriesCard from '@/components/SeriesCard';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function TypePage({ params, searchParams }: Props) {
  const { slug } = params;
  const page = searchParams.page ? parseInt(searchParams.page as string) : undefined;
  const order = typeof searchParams.order === 'string' ? searchParams.order : undefined;
  const data = await getByType(slug, page, order);
  if (!data.items.length) return notFound();
  return (
    <div className="px-4 pt-4 space-y-6">
      <h1 className="text-xl font-bold mb-4">Type: {slug}</h1>
      <div className="grid grid-cols-2 gap-4">
        {data.items.map((item) => (
          <SeriesCard key={item.slug} item={item} />
        ))}
      </div>
      <div className="flex justify-center space-x-4 py-4 text-sm">
        {data.pagination.currentPage > 1 && (
          <a
            href={`?${new URLSearchParams({ ...(order && { order }), page: (data.pagination.currentPage - 1).toString() }).toString()}`}
            className="px-3 py-1 bg-surface border border-neutral-700 rounded hover:bg-neutral-800"
          >
            Previous
          </a>
        )}
        {data.pagination.hasNext && (
          <a
            href={`?${new URLSearchParams({ ...(order && { order }), page: (data.pagination.currentPage + 1).toString() }).toString()}`}
            className="px-3 py-1 bg-surface border border-neutral-700 rounded hover:bg-neutral-800"
          >
            Next
          </a>
        )}
      </div>
    </div>
  );
}
