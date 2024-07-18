import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex gap-6">
      <Skeleton className="h-[220px] w-[150px] md:w-[200px] lg:w-[350px] xl:w-[450px] rounded-xl" />
      <Skeleton className="h-[220px] w-[150px] md:w-[200px] lg:w-[350px] xl:w-[450px] rounded-xl" />
    </div>
  );
}
