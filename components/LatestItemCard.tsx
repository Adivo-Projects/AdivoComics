import Link from 'next/link';
import type { LatestItem } from '@/lib/types';
import { toChapterHref } from '@/lib/source-url';

interface Props {
  item: LatestItem;
}

export default function LatestItemCard({ item }: Props) {
  return (
    <div className="flex gap-3 py-2 border-b border-neutral-800 last:border-none">
      {item.thumbnail && (
        <div className="w-20 h-32 flex-shrink-0 bg-neutral-800 rounded overflow-hidden">
          <img src={item.thumbnail} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1">
        <Link href={`/series/${item.slug}`}>
          <h3 className="font-semibold leading-snug hover:text-primary-dark line-clamp-2 text-sm">{item.title}</h3>
        </Link>
        <p className="text-xs text-muted mt-1">{item.type}</p>
        <ul className="mt-2 space-y-1">
          {item.chapters.map((ch) => (
            <li key={ch.url} className="text-xs">
              <Link href={toChapterHref(ch.url, item.slug)} className="hover:text-primary-dark">
                {ch.title}
              </Link>{' '}
              <span className="text-muted">{ch.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
