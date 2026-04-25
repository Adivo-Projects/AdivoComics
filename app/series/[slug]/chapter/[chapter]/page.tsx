import { getChapter } from '@/lib/komikstation';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string; chapter: string };
}

export default async function ReaderPage({ params }: Props) {
  const { chapter } = params;
  const data = await getChapter(chapter);
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
            <Image
              src={src}
              alt={`Page ${idx + 1}`}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
              priority={idx < 2}
            />
          </div>
        ))}
      </div>
      {/* Navigation between chapters */}
      <div className="flex justify-between items-center px-4 py-4 text-sm">
        {data.prevChapter ? (
          <Link href={data.prevChapter} className="text-primary-dark hover:underline">
            ← Previous
          </Link>
        ) : (
          <span />
        )}
        {data.nextChapter ? (
          <Link href={data.nextChapter} className="text-primary-dark hover:underline">
            Next →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
        }
