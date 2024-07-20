import { Suspense } from 'react';
import { BandList } from './BandList';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function BandsPage({ params }: { params: { _id: string } }) {
  return (
    <Suspense
      fallback={
        <LoadingSpinner className=" text-black absolute top-[50%] left-[50%]" />
      }
    >
      <BandList id={params._id} />
    </Suspense>
  );
}
