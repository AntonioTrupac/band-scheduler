import { fetchBands } from '@/api/band';
import { CreateBandTrigger } from '@/components/CreateBandTrigger';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ErrorWrapper } from '@/components/ui/error-wrapper';
import { PublicMetadata } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { DeleteBandTrigger } from '@/components/DeleteBandTrigger';

export const BandList = async ({ studioId }: { studioId: string }) => {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.sub;
  const bands = await fetchBands(studioId);

  const { role } = (sessionClaims?.publicMetadata as PublicMetadata) || {};
  const userHasABand = bands.data?.some((band) => band.createdBy === userId);

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
            href={`/studio/${studioId}`}
          >
            Go back to studio schedule
          </Link>
        </div>
      </ErrorWrapper>
    );
  }

  return (
    <main className="flex flex-col min-h-[calc(100vh-128px)] bg-gray-50 px-12 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl">List of registered bands</h1>
        {!userHasABand && <CreateBandTrigger id={studioId} />}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {bands.data.map((band) => (
          <Card
            key={band._id.toString()}
            className="p-4 flex flex-col justify-between"
          >
            <CardHeader className="p-0">
              <h2>Band: {band.name}</h2>
              <p>Location: {band.location}</p>
            </CardHeader>

            {/* TODO: we need to create these 2 pages in V2  */}
            {/* {band.rehearsals.length > 0 && (
              <Link
                className={buttonVariants({
                  variant: 'outline',
                  className: `px-4 mb-2 mt-4`,
                })}
                href={`/studio/${id}/bands/${band._id.toString()}/schedule`}
              >
                View scheduled timeslots
              </Link>
            )}

            <Link
              className={buttonVariants({
                variant: 'default',
                className: `px-4`,
              })}
              href={`/studio/${id}/schedule/${band._id.toString()}`}
            >
              Schedule a timeslot
            </Link> */}
            {role === 'admin' && (
              <DeleteBandTrigger
                bandId={band._id.toString()}
                studioId={studioId}
              />
            )}
          </Card>
        ))}
      </div>
    </main>
  );
};
