import Link from 'next/link';
import type { SeriesCard as Card } from '@/lib/types';

interface Props {
  item: Card;
  orientation?: 'vertical' | 'horizontal';
}

export default function SeriesCard({ item, orientation = 'vertical' }: Props) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <Link href={`/series/${item.slug}`} className={`block group ${isHorizontal ? 'flex gap-2' : ''}`.trim()}>
      {item.thumbnail && (
        <div
          className={`${isHorizontal ? 'flex-shrink-0 w-20 h-28' : 'w-full aspect-[5/7]'} bg-neutral-800 rounded overflow-hidden`}
        >
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className={`${isHorizontal ? 'flex-1 mt-0' : 'mt-2'}`}>
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary-dark">{item.title}</h3>
        {item.latestChapter && <p className="text-xs text-muted mt-1">{item.latestChapter}</p>}
      </div>
    </Link>
  );
}
