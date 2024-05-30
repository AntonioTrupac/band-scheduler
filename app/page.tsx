import { BandForm } from '@/components/BandForm';

// Server component
export default async function Home() {
  // const bands = await fetchBands();

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1>Band Rehearsal Scheduler</h1>
      <div>
        <BandForm />
      </div>
      {/* {bands.success && !!bands?.data?.length ? (
        <div>
          {bands.data.map((band) => (
            <div key={band._id}>
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
