import { SignedIn } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default function HomePage() {
  const { userId } = auth();

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="mb-8">Welcome to the Band Manager</h1>

      <p className="mb-8">
        This is a simple band manager application that allows you to create
        bands and schedule rehearsals.
      </p>

      <p className="mb-8">
        You can manage your bands and rehearsals in the dashboard.
      </p>

      <p className="mb-8">You can create a new band in the studio.</p>

      <SignedIn>
        <Link href="/studio">Register a new studio</Link>
      </SignedIn>
    </main>
  );
}
