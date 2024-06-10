import { StudioSidebar } from '@/components/StudioSidebar';

export default function StudioLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className="grid grid-cols-sidebar grid-rows-sidebar h-[calc(100vh-60px)]">
      <StudioSidebar />
      {children}
    </section>
  );
}
