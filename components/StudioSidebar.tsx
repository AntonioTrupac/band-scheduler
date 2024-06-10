import Link from 'next/link';

export const StudioSidebar = () => {
  return (
    <aside className="max-w-[300px] bg-slate-50 border-t-[1px]">
      <ul className="flex flex-col h-full space-y-4 px-8">
        <li className="mt-4">
          <Link href="/studio">Dashboard</Link>
        </li>
        <li>
          <Link href="/studio/bands">Bands</Link>
        </li>
        <li>
          <Link href="/studio/schedule">Schedule</Link>
        </li>
        {/* <li>Tracks</li>
        <li>Settings</li> */}
      </ul>
    </aside>
  );
};
