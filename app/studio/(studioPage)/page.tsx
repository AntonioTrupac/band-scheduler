import Link from 'next/link';
import { unstable_cache as cache } from 'next/cache';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { getStudios } from '@/api/studio';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BandScheduler | Studios',
  description: 'View list of studios.',
};

export const getCachedStudios = cache(getStudios, ['studios'], {
  tags: ['studios'],
});

export default async function StudioPage() {
  const studios = await getCachedStudios();

  if (!studios.data || !studios.success) {
    return <div>Failed to fetch studios</div>;
  }

  return (
    <main className="flex flex-col px-12 py-8 bg-gray-50 h-[calc(100dvh-68px)]">
      <h1 className="mb-6 text-xl">Studio environments</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {studios.data.map((studio) => (
          <Card key={studio._id.toString()}>
            <CardHeader>
              <div className="flex flex-col mb-2">
                <span className="text-lg underline mb-1">Studio name</span>
                <CardTitle className="">{studio.name}</CardTitle>
              </div>

              <div>
                <span className="text-lg underline mb-1">Location</span>
                <CardDescription>{studio.location}</CardDescription>
              </div>
            </CardHeader>

            <CardFooter>
              <Link
                className={buttonVariants({
                  variant: 'default',
                  className: `w-full mr-4`,
                })}
                href={`/studio/${studio._id.toString()}/`}
              >
                View schedule
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
