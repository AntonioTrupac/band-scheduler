import Link from 'next/link';
import { unstable_cache as cache } from 'next/cache';

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import connectMongo from '@/lib/mongodb';
import StudioModel from '@/models/Studio';
import { buttonVariants } from '@/components/ui/button';

const getStudios = async () => {
  await connectMongo();
  try {
    const studios = await StudioModel.find({
      name: { $exists: true },
      location: { $exists: true },
    }).lean();

    return studios;
  } catch (error) {
    console.error(error);
    throw new Error(error as any);
  }
};

const getCachedStudios = cache(getStudios, ['studios'], {
  tags: ['studios'],
});

export default async function StudioPage() {
  const studios = await getCachedStudios();
  console.log('st', studios);
  return (
    <main className="flex flex-col px-12 py-8">
      <h1 className="mb-8 text-xl">Studios</h1>

      <div className="grid grid-cols-3 gap-4">
        {studios.map((studio) => (
          <Card key={studio._id.toString()}>
            <CardHeader>
              <CardTitle>{studio.name}</CardTitle>
              <CardDescription>{studio.location}</CardDescription>
            </CardHeader>

            <CardFooter>
              <Link
                className={buttonVariants({
                  variant: 'default',
                  className: `w-full mr-4`,
                })}
                href={`/studio/${studio._id.toString()}/bands`}
              >
                View studio
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
