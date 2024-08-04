import { getBandsByDate } from '@/api/band';
import { buttonVariants } from '@/components/ui/button';
import { ErrorWrapper } from '@/components/ui/error-wrapper';
import { unstable_cache as cache } from 'next/cache';
import Link from 'next/link';
import { BandScheduleItem } from './BandScheduleItem';
import { useBand } from '@/hooks/use-band';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BandScheduler | Day Schedule',
  description: 'View the schedule for a specific day.',
};

const getCachedBandsByDate = cache(getBandsByDate, ['bandsByDate'], {
  tags: ['bandsByDate'],
});

export default async function ScheduleDayPage({
  params,
}: {
  params: { _id: string; date: string };
}) {
  const bands = await getCachedBandsByDate(params._id, params.date);
  const { getRehearsals } = useBand();

  if (!bands.success || !bands.data) {
    return (
      <ErrorWrapper>
        <div className="flex flex-col justify-center items-center gap-4">
          <div className="text-2xl font-medium">Failed to fetch bands</div>
          <Link
            className={buttonVariants({
              variant: 'outline',
              className: `w-full`,
            })}
            href={`/studio/${params._id}`}
          >
            Go back to studio schedule
          </Link>
        </div>
      </ErrorWrapper>
    );
  }

  const rehearsals = getRehearsals(bands.data, params._id);

  return (
    <div className="bg-gray-50 py-12 min-h-[calc(100vh-128px)]">
      <div className="shadow-md mx-8">
        <div className="flex items-center bg-gray-100 border-b-[1px] rounded-t-sm">
          <div className="border-r-[1px] py-4 pl-8 pr-4 flex-grow">
            Band name
          </div>
          <div className="border-r-[1px] py-4 pl-8 pr-4 min-w-[250px]">
            Reharsal day
          </div>
          <div className="border-r-[1px] py-4 pl-8 pr-4 min-w-[150px]">
            Start
          </div>
          <div className="py-4 pl-8 pr-4 min-w-[150px]">End</div>
        </div>

        {rehearsals.map((reh) => {
          return (
            <div key={reh._id}>
              <BandScheduleItem rehearsal={reh} studioId={params._id} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
