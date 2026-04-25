import { getHome } from '@/lib/komikstation';
import SeriesCard from '@/components/SeriesCard';
import LatestItemCard from '@/components/LatestItemCard';

export const revalidate = 60 * 5; // revalidate home every 5 minutes on server

export default async function HomePage() {
  const data = await getHome();
  return (
    <div className="px-4 pt-4 space-y-8">
      {/* Trending */}
      <section>
        <h2 className="text-lg font-bold mb-2">Trending</h2>
        <div className="flex overflow-x-auto space-x-4 pb-2">
          {data.trending.map((item) => (
            <div key={item.slug} className="w-40 flex-shrink-0">
              <SeriesCard item={item} />
            </div>
          ))}
        </div>
      </section>
      {/* Latest Updates */}
      <section>
        <h2 className="text-lg font-bold mb-2">Latest Updates</h2>
        <div className="divide-y divide-neutral-800">
          {data.latest.map((item) => (
            <LatestItemCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
      {/* Popular section */}
      <section>
        <h2 className="text-lg font-bold mb-2">Popular</h2>
        {(['weekly', 'monthly', 'alltime'] as const).map((range) => (
          <div key={range} className="mb-6">
            <h3 className="font-semibold capitalize mb-1 text-sm text-primary-dark">{range}</h3>
            <div className="flex overflow-x-auto space-x-4 pb-2">
              {data.popular[range].map((item) => (
                <div key={item.slug} className="w-36 flex-shrink-0">
                  <SeriesCard item={item} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      {/* Project list */}
      <section>
        <h2 className="text-lg font-bold mb-2">Project List</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.projectList.map((item) => (
            <SeriesCard key={item.slug} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}