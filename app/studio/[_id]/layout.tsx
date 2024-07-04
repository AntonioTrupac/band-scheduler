import { StudioSidebar } from '@/components/StudioSidebar';

export default function StudioLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { _id: string } }>) {
  return (
    <section className="h-[calc(100vh-128px)]">
      <StudioSidebar _id={params._id} />
      <div className="bg-gray-100">{children}</div>
    </section>
  );
}
