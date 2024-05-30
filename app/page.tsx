import { fetchBands } from '@/actions/bandActions';
import { BandForm } from '@/components/BandForm';

// Server component
export default async function Home() {
  const bands = await fetchBands();

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
  }
  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="mb-8">Band Rehearsal Scheduler</h1>
      <BandForm bands={bands.data} />
    </main>
  );
}
