import { fetchBands } from '@/api/band';
import { Button, buttonVariants } from '@/components/ui/button';
// import { BandForm } from '@/components/BandForm';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

// Server component
export default async function Home({ params }: { params: { _id: string } }) {
  console.log(params._id);
  const bands = await fetchBands(params._id);

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
  }

  return (
    <main className="flex flex-col px-12 py-8">
      <h1 className="mb-8">Band Rehearsal Scheduler</h1>
      {/* <BandForm bands={bands.data} /> */}

      <Link
        className={buttonVariants({
          variant: 'default',
          className: `w-1/6 mr-4`,
        })}
        href={`/studio/${params._id}/bands/create`}
      >
        Create a Band
      </Link>

      <div className="grid grid-cols-3 gap-4">
        {bands.data.map((band) => (
          <Card key={band._id.toString()}>
            <h2>{band.name}</h2>
          </Card>
        ))}
      </div>
    </main>
  );
}
