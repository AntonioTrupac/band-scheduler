import { ScheduleForm } from '@/components/ScheduleForm';

export default function CreateBandSchedule({
  params,
}: {
  params: { _id: string; _bandId: string };
}) {
  return (
    <div className="py-8 px-12">
      <ScheduleForm studioId={params._id} bandId={params._bandId} />
    </div>
  );
}
