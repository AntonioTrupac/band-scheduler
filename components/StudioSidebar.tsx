import Link from 'next/link';
import { SidebarNav } from './SidebarNav';

export const StudioSidebar = ({ _id }: { _id: string }) => {
  return (
    <aside className="max-w-[300px] bg-slate-50 border-t-[1px]">
      <SidebarNav id={_id} />
    </aside>
  );
};
