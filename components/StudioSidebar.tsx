import { SidebarNav } from './SidebarNav';

export const StudioSidebar = ({ _id }: { _id: string }) => {
  return (
    <div className="border-t-[1px] border-b-[1px]">
      <SidebarNav id={_id} />
    </div>
  );
};
