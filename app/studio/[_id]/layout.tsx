import { getStudioById } from '@/api/studio';
import { StudioSidebar } from '@/components/StudioSidebar';
import { cache } from 'react';

const getCachedStudio = cache(getStudioById);

export default async function StudioLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { _id: string } }>) {
  const studio = await getCachedStudio(params._id);
  console.log(studio);
  return (
    <section>
      <StudioSidebar id={params._id} studioName={studio.data?.name} />
      <div className="bg-gray-50 min-h-dvh">{children}</div>
    </section>
  );
}
