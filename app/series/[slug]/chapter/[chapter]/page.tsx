import { getChapter } from '@/lib/komikstation';
import { toChapterHref, toSourceChapterUrl } from '@/lib/source-url';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string; chapter: string };
}

export default async function ReaderPage({ params }: Props) {
  const { chapter } = params;
  const data = await getChapter(toSourceChapterUrl(chapter));
  if (!data) return notFound();
  return (
    <div className="px-0 pt-4">
      <div className="px-4">
        <h1 className="text-lg font-bold mb-2">{data.title}</h1>
      </div>
      {/* Reader images */}
      <div className="flex flex-col items-center space-y-4">
        {data.images.map((src, idx) => (
          <div key={idx} className="w-full relative" style={{ minHeight: '80vh' }}>
            {/* Use priority for first few images */}
            <img
              src={src}
              alt={`Page ${idx + 1}`}
              loading={idx < 2 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-auto object-contain"
            />
          </div>
        ))}
      </div>
      {/* Navigation between chapters */}
      <div className="flex justify-between items-center px-4 py-4 text-sm">
        {data.prevChapter ? (
          <Link href={toChapterHref(data.prevChapter, params.slug)} className="text-primary-dark hover:underline">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {data.nextChapter ? (
          <Link href={toChapterHref(data.nextChapter, params.slug)} className="text-primary-dark hover:underline">
            Next →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}