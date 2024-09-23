import { CreateStudioTrigger } from '@/components/CreateStudioTrigger';
import { SignedIn, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = auth();
  const publicMetadata = sessionClaims?.publicMetadata;
  const role = (publicMetadata as { userType: string }).userType;

  return (
    <>
      <header className="flex justify-between items-center py-4 px-12 sticky top-0 z-50 bg-white shadow-sm">
        <h1 className="text-xl">Band Manager</h1>
        <nav className="flex items-center">
          <SignedIn>
            {role === 'admin' && <CreateStudioTrigger />}
            <UserButton />
          </SignedIn>
        </nav>
      </header>
      {children}
    </>
  );
}
