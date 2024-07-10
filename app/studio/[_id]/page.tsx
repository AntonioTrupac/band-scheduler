import { fetchBands } from '@/api/band';
import { StudioSchedule } from '@/components/StudioSchedule';

export default async function SchedulePage({
  params,
}: {
  params: { _id: string };
}) {
  const bands = await fetchBands(params._id);

  if (!bands.success || !bands.data) {
    return <div>Failed to fetch bands</div>;
  }

  return <StudioSchedule bands={bands.data} studioId={params._id} />;
}
