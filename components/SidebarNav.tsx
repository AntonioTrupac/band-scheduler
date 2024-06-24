'use client';

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
    <ul className="flex flex-col h-full space-y-4 px-8">
      <li className="mt-4">
        <Link href={`/studio/${id}`}>Schedule</Link>
      </li>
      <li>
        <Link href={`/studio/${id}/bands`}>Bands</Link>
      </li>
    </ul>
  );
};
