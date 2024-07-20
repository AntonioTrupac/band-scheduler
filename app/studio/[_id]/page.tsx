import Link from 'next/link';
import { Suspense } from 'react';

import { fetchBands } from '@/api/band';
import { StudioSchedule } from '@/components/StudioSchedule';
import { buttonVariants } from '@/components/ui/button';
import { ErrorWrapper } from '@/components/ui/error-wrapper';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default async function SchedulePage({
  params,
}: {
  params: { _id: string };
}) {
  const bands = await fetchBands(params._id);

  if (!bands.success || !bands.data) {
    return (
      <ErrorWrapper>
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="text-2xl font-medium">
            Failed to load the schedule
          </div>
          <Link
            className={buttonVariants({
              variant: 'outline',
              className: `w-full`,
            })}
            href={`/studio`}
          >
            Go back to studio
          </Link>
        </div>
      </ErrorWrapper>
    );
  }

  return (
    <Suspense
      fallback={
        <LoadingSpinner className=" text-black absolute top-[50%] left-[50%]" />
      }
    >
      <StudioSchedule bands={bands.data} studioId={params._id} />
    </Suspense>
  );
}
