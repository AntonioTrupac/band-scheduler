import { getStudioById } from '@/api/studio';
import { StudioNavbar } from '@/components/StudioNavbar';
import { auth } from '@clerk/nextjs/server';
import { unstable_cache as cache } from 'next/cache';

const getCachedStudio = cache(getStudioById, ['studio'], {
  tags: ['studio'],
});

export default async function StudioIdLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { _id: string } }>) {
  const { userId } = auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const studio = await getCachedStudio(params._id);

  return (
    <section>
      <StudioNavbar id={params._id} studioName={studio.data?.name} />
      {children}
    </section>
  );
}
