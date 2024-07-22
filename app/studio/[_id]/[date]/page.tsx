import { getBandsByDate } from '@/api/band';
import { buttonVariants } from '@/components/ui/button';
import { ErrorWrapper } from '@/components/ui/error-wrapper';
import { unstable_cache as cache } from 'next/cache';
import Link from 'next/link';

const getCachedBandsByDate = cache(getBandsByDate, ['bandsByDate'], {
  tags: ['bandsByDate'],
});

export default async function ScheduleDayPage({
  params,
}: {
  params: { _id: string; date: string };
}) {
  const bands = await getCachedBandsByDate(params._id, params.date);

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
  const rehearsals = bands.data
    .filter((band) => {
      return band.studioId === params._id;
    })
    .flatMap((band) => {
      return band.rehearsals.map((rehearsal) => ({
        ...rehearsal,
        name: band.name,
      }));
    });
  console.log('rehearsals', rehearsals);
  console.log('bands', bands);

  return (
    <div>
      {rehearsals.map((reh) => {
        return (
          <div key={reh._id}>
            <div>{reh.name}</div>
            <div>{reh.title}</div>
            {/* <div>{reh.start}</div> */}
            {/* <div>{reh.end.toISOString()}</div> */}
          </div>
        );
      })}
    </div>
  );
}
