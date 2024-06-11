import { fetchBands } from '@/actions/bandActions';
import { BandForm } from '@/components/BandForm';
import { Card } from '@/components/ui/card';

// Server component
export default async function Home() {
  const bands = await fetchBands();

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
  }
  return (
    <main className="flex flex-col px-12 py-8">
      <h1 className="mb-8">Band Rehearsal Scheduler</h1>
      {/* <BandForm bands={bands.data} /> */}

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
