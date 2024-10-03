/* eslint-disable react/no-unescaped-entities */
import { SignedOut } from '@clerk/nextjs';
import { Metadata } from 'next';
import Image from 'next/image';
import { SpeakerLoudIcon } from '@radix-ui/react-icons';
import { SignIn } from './SignIn';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { currentUser } from '@clerk/nextjs/server';

import Link from 'next/link';
export const metadata: Metadata = {
  title: 'BandScheduler | Sign In',
  description: "Sign in to manage your band's schedule and rehearsal times.",
};

export default async function SignInPage() {
  return (
    <SignedOut>
      <div className="flex h-screen overflow-hidden bg-gray-100">
        <div className="flex w-full flex-col items-center justify-center lg:w-1/2 p-8 relative">
          <div className="absolute inset-0 bg-grid-gray-100 bg-grid-gray-900/[0.2] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] -z-10" />
          <Card className="w-full bg-gray-50 max-w-md shadow-xl">
            <CardHeader className="space-y-1">
              <div className="flex items-center gap-4 justify-center">
                <CardTitle className="text-2xl font-bold text-center">
                  Welcome back
                </CardTitle>
                <SpeakerLoudIcon className="h-8 w-8 text-primary" />
              </div>

              <CardDescription className="text-center">
                Sign in to manage your band's schedule and rehearsal times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SignIn />
            </CardContent>
          </Card>
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{' '}
              <Link
                href="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
        <div className="hidden lg:block relative w-1/2 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
          <Image
            alt="Band performing on stage"
            src="/pexels.webp"
            layout="fill"
            objectFit="cover"
            quality={90}
            priority
            className="absolute inset-0 object-center object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white p-8">
            <h2 className="text-5xl font-bold mb-6 animate-fade-in-up">
              Manage Your Band
            </h2>
            <p className="text-xl text-center max-w-lg animate-fade-in-up animation-delay-150">
              Streamline your rehearsals, gigs, and collaborations with Band
              Manager. Take control of your music career today!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-300">
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                Schedule Multiple Sessions
              </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                Manage Studio Time
              </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                Coordinate Band Members
              </span>
              <span className="px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
                Track Rehearsal Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </SignedOut>
  );
}
