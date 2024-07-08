'use client';

import { CalendarIcon, PlayIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const SidebarNav = ({
  id,
  studioName,
}: {
  id: string;
  studioName?: string;
}) => {
  const pathname = usePathname();

  return (
    <ul className="flex px-8">
      <li>
        <Link
          href={`/studio/${id}`}
          className={`flex items-center p-4 gap-2 ${pathname === `/studio/${id}` ? 'border-b-[2px] border-b-blue-800' : ''}`}
        >
          <CalendarIcon />
          Schedule
        </Link>
      </li>
      <li>
        <Link
          href={`/studio/${id}/bands`}
          className={`flex items-center p-4 gap-2 ${pathname === `/studio/${id}/bands` ? 'border-b-[2px] border-b-blue-800' : ''}`}
        >
          <PlayIcon />
          Bands
        </Link>
      </li>
    </ul>
  );
};
