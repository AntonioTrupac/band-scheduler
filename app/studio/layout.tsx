import { CreateStudioTrigger } from '@/components/CreateStudioTrigger';
import { Button, buttonVariants } from '@/components/ui/button';
import { SignedIn, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex justify-between items-center py-4 px-12 sticky top-0 z-50 bg-white shadow-sm">
        <h1 className="text-xl">Band Manager</h1>
        <nav className="flex items-center">
          <SignedIn>
            <CreateStudioTrigger />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>
      {children}
    </>
  );
}
