import { fetchBands } from '@/api/band';
import { StudioSchedule } from '@/components/StudioSchedule';

export default async function Page({ params }: { params: { _id: string } }) {
  const bands = await fetchBands(params._id);

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
  }

  return (
    <div className="max-w-full max-h-[calc(100vh-68px)] overflow-y-scroll">
      <StudioSchedule bands={bands.data} studioId={params._id} />
    </div>
  );
}
