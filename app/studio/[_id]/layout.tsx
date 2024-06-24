import { StudioSidebar } from '@/components/StudioSidebar';

export default function StudioLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { _id: string } }>) {
  return (
    <section className="grid grid-cols-sidebar grid-rows-sidebar h-[calc(100vh-68px)]">
      <StudioSidebar _id={params._id} />
      {children}
    </section>
  );
}
