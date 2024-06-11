import Link from 'next/link';

export const StudioSidebar = ({ _id }: { _id: string }) => {
  return (
    <aside className="max-w-[300px] bg-slate-50 border-t-[1px]">
      <ul className="flex flex-col h-full space-y-4 px-8">
        <li className="mt-4">
          <Link href={`/studio/${_id}/bands`}>Bands</Link>
        </li>
        <li>
          <Link href={`/studio/${_id}/schedule`}>Schedule</Link>
        </li>
      </ul>
    </aside>
  );
};
