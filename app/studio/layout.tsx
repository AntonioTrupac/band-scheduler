import { CreateStudioTrigger } from '@/components/CreateStudioTrigger';
import { SignedIn, UserButton } from '@clerk/nextjs';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex justify-between items-center py-4 px-12 sticky top-0 z-50 sticky bg-white shadow-sm">
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
