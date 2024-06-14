import { BandForm } from '@/components/BandForm';

export default function CreateBandPage({
  params,
}: {
  params: { _id: string };
}) {
  return (
    <div className="p-8">
      <BandForm studioId={params._id} />
    </div>
  );
}
