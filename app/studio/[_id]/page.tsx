import { fetchBands } from '@/api/band';
import { StudioSchedule } from '@/components/StudioSchedule';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Suspense } from 'react';

export default async function SchedulePage({
  params,
}: {
  params: { _id: string };
}) {
  const bands = await fetchBands(params._id);

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
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
