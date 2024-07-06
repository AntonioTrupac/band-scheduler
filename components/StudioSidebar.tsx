import { SidebarNav } from './SidebarNav';

export const StudioSidebar = ({ id }: { id: string }) => {
  return (
    <div className="border-t-[1px] border-b-[1px] sticky top-[68px] z-50">
      <SidebarNav id={id} />
    </div>
  );
};
