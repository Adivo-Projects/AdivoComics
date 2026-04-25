import Image from 'next/image';
import Link from 'next/link';
import type { SeriesCard as Card } from '@/lib/types';

interface Props {
  item: Card;
  orientation?: 'vertical' | 'horizontal';
}

export default function SeriesCard({ item, orientation = 'vertical' }: Props) {
  return (
    <Link href={`/series/${item.slug}`} className={`block group ${orientation === 'horizontal' ? 'flex gap-2' : ''}`.trim()}>
      {item.thumbnail && (
        <div className={`${orientation === 'horizontal' ? 'flex-shrink-0' : ''} bg-neutral-800 rounded overflow-hidden relative w-full`}
             style={{ width: orientation === 'horizontal' ? '80px' : '100%', height: orientation === 'horizontal' ? '120px' : '0', paddingBottom: orientation === 'horizontal' ? undefined : '140%' }}>
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            sizes={orientation === 'horizontal' ? '80px' : '100vw'}
            className="object-cover"
          />
        </div>
      )}
      <div className={`${orientation === 'horizontal' ? 'flex-1' : ''} mt-2`}> 
        <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary-dark">{item.title}</h3>
        {item.latestChapter && <p className="text-xs text-muted mt-1">{item.latestChapter}</p>}
      </div>
    </Link>
  );
}