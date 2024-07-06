import { StudioSidebar } from '@/components/StudioSidebar';

export default function StudioLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { _id: string } }>) {
  return (
    <section>
      <StudioSidebar id={params._id} />
      <div className="bg-gray-100 min-h-dvh">{children}</div>
    </section>
  );
}
