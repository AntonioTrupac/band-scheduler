import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="px-12 py-8">
      <Skeleton className="h-8 w-72 mb-6" />
      <div className="flex gap-6">
        <Skeleton className="h-[220px] w-[150px] md:w-[200px] lg:w-[350px] xl:w-[450px] rounded-xl" />
        <Skeleton className="h-[220px] w-[150px] md:w-[200px] lg:w-[350px] xl:w-[450px] rounded-xl" />
      </div>
    </div>
  );
}
