import Link from 'next/link';
import { unstable_cache as cache } from 'next/cache';

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { getStudios } from '@/api/studio';
import { Metadata } from 'next';
import { getAuthedUserId } from '@/api/auth';
import { CreateInvitationModalTrigger } from '@/components/CreateInvitationModalTrigger';
import { HomeIcon } from '@radix-ui/react-icons';

export const metadata: Metadata = {
  title: 'BandScheduler | Studios',
  description: 'View list of studios.',
};

const getCachedStudios = cache(getStudios, ['studios'], {
  tags: ['studios'],
});

export default async function StudioPage() {
  const userId = getAuthedUserId();
  const studios = await getCachedStudios(userId);

  if (!studios.success) {
    return <div className="py-12 px-8 text-lg">{studios.errors?.message}</div>;
  }

  if (studios.data && studios.data.length < 1) {
    return <div className="py-12 px-8 text-lg">No studios found</div>;
  }

  return (
    <main className="flex flex-col px-12 py-8 bg-gray-50 h-[calc(100dvh-68px)]">
      <h1 className="mb-6 text-xl">Studio environments</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {studios.data?.map((studio) => (
          <Card
            key={studio._id.toString()}
            className="flex flex-col overflow-hidden"
          >
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold">
                {studio.name}
              </CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <HomeIcon className="w-6 h-6 mr-1" />
                <span className="text-lg">{studio.location}</span>
              </div>
            </CardHeader>

            <CardFooter className="flex flex-col gap-0.5 bg-muted/50 p-4">
              <Link
                className={buttonVariants({
                  variant: 'default',
                  className: 'w-full',
                })}
                href={`/studio/${studio._id.toString()}/`}
              >
                View schedule
              </Link>
              <CreateInvitationModalTrigger studioId={studio._id.toString()} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
