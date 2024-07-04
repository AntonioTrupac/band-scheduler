'use client';

import { CalendarIcon, PlayIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export const SidebarNav = ({ id }: { id: string }) => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === `/studio/${id}`) {
      document.documentElement.style.overflow = 'hidden';
    }

    return () => {
      document.documentElement.style.overflow = '';
    };
  });

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
