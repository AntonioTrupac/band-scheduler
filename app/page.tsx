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
      <div>
        <BandForm bands={bands.data} />
      </div>
      {/* {bands.success && !!bands?.data?.length ? (
        <div>
          {bands.data.map((band) => (
            <div key={band._id?.$oid}>
              <h2>{band.name}</h2>
              <ul>
                {band.rehearsals.map((rehearsal) => (
                  <li key={rehearsal.title}>
                    <h3>{rehearsal.title}</h3>
                    <p>{rehearsal.start.getDate()}</p>
                    <p>{rehearsal.end.getDate()}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div>Empty</div>
      )} */}
    </main>
  );
}
