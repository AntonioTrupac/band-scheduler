import { type Metadata } from 'next';
import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { LockClosedIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { StudioInvitationForm } from './StudioInvitationForm';
import { validateInvitation } from '@/lib/validateInvitation';

export const metadata: Metadata = {
  title: 'BandScheduler | Studio Invitation',
  description:
    'Accept your exclusive invitation to join the studio environment.',
};

const assertString = (value: unknown): string => {
  if (!value) {
    // TODO: throw an error here
    return '';
  }

  if (typeof value !== 'string') {
    throw new Error('Invalid string value');
  }

  return value;
};

export default async function StudioInvitationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = assertString(searchParams.token);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-4">Invalid Invitation</h1>
          <p className="text-gray-600">
            The invitation link is missing required parameters.
          </p>
          <div className="mt-4">
            <Link href="/" className="px-4 py-2 bg-primary text-white rounded">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const invitationValidation = await validateInvitation({ token });

  if (!invitationValidation.isValid || !invitationValidation.studioId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Invalid Invitation</h1>
          <p className="text-gray-600">{invitationValidation.message}</p>
          <div className="mt-4">
            <Link href="/" className="px-4 py-2 bg-primary text-white rounded">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Left Side */}
      <div className="flex w-full flex-col items-center justify-center p-8 relative">
        <div className="absolute inset-0 bg-grid-gray-100 bg-grid-gray-900/[0.2] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
        <Card className="w-full bg-gray-50 max-w-md shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-4 justify-center">
              <CardTitle className="text-2xl font-bold text-center">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You're Invited!
              </CardTitle>
              <LockClosedIcon className="h-8 w-8 text-primary" />
            </div>

            <CardDescription className="text-center">
              Accept your exclusive invitation to join our studio environment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StudioInvitationForm
              token={token}
              studioId={invitationValidation.studioId}
            />
          </CardContent>
        </Card>
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
      {/* Right Side */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
        <Image
          alt="Professional recording studio"
          src="/studio-background.webp"
          layout="fill"
          objectFit="cover"
          quality={90}
          priority
          className="absolute inset-0 object-center object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white p-8">
          <h2 className="text-5xl font-bold mb-6 animate-fade-in-up">
            Welcome to the Studio
          </h2>
          <p className="text-xl text-center max-w-lg animate-fade-in-up animation-delay-150">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Collaborate, create, and manage your band's studio sessions like
            never before.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-300">
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              Exclusive Collaboration Tools
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              Priority Studio Scheduling
            </span>
            <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              Secure File Sharing
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
