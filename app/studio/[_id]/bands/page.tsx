import { Suspense } from 'react';
import { BandList } from './BandList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export async function generateMetadata() {
  return {
    title: `BandScheduler | Registered bands`,
    description: `View the bands for a studio`,
  };
}

export default function BandsPage({ params }: { params: { _id: string } }) {
  return (
    <Suspense
      fallback={
        <LoadingSpinner className=" text-black absolute top-[50%] left-[50%]" />
      }
    >
      <BandList studioId={params._id} />
    </Suspense>
  );
}
