import { fetchBands } from '@/api/band';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { ErrorWrapper } from '@/components/ui/error-wrapper';
import Link from 'next/link';

export const BandList = async ({ id }: { id: string }) => {
  const bands = await fetchBands(id);

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
            href={`/studio/${id}`}
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
        <Link
          className={buttonVariants({
            variant: 'default',
            className: `px-4`,
          })}
          href={`/studio/${id}/bands/create`}
        >
          Create a Band
        </Link>
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

            {band.rehearsals.length > 0 && (
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
              // Todo: proper href needed, also need to create schedule [id] page
              href={`/studio/${id}/schedule/${band._id.toString()}`}
            >
              Schedule a timeslot
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
};
