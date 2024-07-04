import { fetchBands } from '@/api/band';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default async function Home({ params }: { params: { _id: string } }) {
  const bands = await fetchBands(params._id);

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
  }

  return (
    <main className="flex flex-col min-h-[calc(100vh-128px)] px-12 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl">Band Rehearsal Scheduler</h1>

        <Link
          className={buttonVariants({
            variant: 'default',
            className: `px-4`,
          })}
          href={`/studio/${params._id}/bands/create`}
        >
          Create a Band
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bands.data.map((band) => (
          <Card
            key={band._id.toString()}
            className="p-4 h-[150px] flex flex-col justify-between"
          >
            <CardHeader className="p-0">
              <h2>{band.name}</h2>
              <p>{band.location}</p>
            </CardHeader>

            <Link
              className={buttonVariants({
                variant: 'default',
                className: `px-4`,
              })}
              // Todo: proper href needed, also need to create schedule [id] page
              href={`/studio/${params._id}/schedule/${band._id.toString()}`}
            >
              Create a schedule
            </Link>
          </Card>
        ))}
      </div>
    </main>
  );
}
