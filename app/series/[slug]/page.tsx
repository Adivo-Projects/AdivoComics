import { getDetail } from '@/lib/komikstation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SeriesCard from '@/components/SeriesCard';
import { toChapterHref } from '@/lib/source-url';

interface Props {
  params: { slug: string };
}

export default async function SeriesDetailPage({ params }: Props) {
  const slug = params.slug;
  const data = await getDetail(slug);
  if (!data) return notFound();
  return (
    <div className="px-4 pt-4 space-y-6">
      <div className="flex gap-4">
        {data.cover && (
          <div className="w-32 h-48 flex-shrink-0 bg-neutral-800 rounded overflow-hidden">
            <img src={data.cover} alt={data.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold mb-1">{data.title}</h1>
          {data.alternativeTitles.length > 0 && (
            <p className="text-xs text-muted mb-2">Alt: {data.alternativeTitles.join(', ')}</p>
          )}
          <p className="text-sm text-muted mb-2">
            {data.type && <span className="mr-2">Type: {data.type}</span>}
            {data.status && <span>Status: {data.status}</span>}
          </p>
          <p className="text-sm text-muted mb-2">
            {data.author && <span className="mr-2">Author: {data.author}</span>}
            {data.illustrator && <span>Illustrator: {data.illustrator}</span>}
          </p>
          {data.genres.length > 0 && (
            <p className="text-sm mb-2">
              Genres:{' '}
              {data.genres.map((g, idx) => (
                <Link key={g.slug} href={`/genre/${g.slug}`} className="text-primary-dark hover:underline">
                  {g.name}
                  {idx < data.genres.length - 1 ? ', ' : ''}
                </Link>
              ))}
            </p>
          )}
          {data.rating && (
            <p className="text-sm text-muted">Rating: {data.rating}</p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-2">Synopsis</h2>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{data.synopsis}</p>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-2">Chapters</h2>
        <ul className="divide-y divide-neutral-800 text-sm">
          {data.chapters.map((ch) => (
            <li key={ch.url} className="py-2 flex justify-between items-center">
              <Link href={toChapterHref(ch.url, data.slug)} className="hover:text-primary-dark">
                {ch.chapter}
              </Link>
              {ch.date && <span className="text-xs text-muted">{ch.date}</span>}
            </li>
          ))}
        </ul>
      </div>
      {data.recommendations && data.recommendations.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.recommendations.map((item) => (
              <SeriesCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}