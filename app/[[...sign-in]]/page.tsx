import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-screen overflow-hidden">
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="mb-20 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Welcome back to Band Manager
          </h1>
          <p className="text-xl font-medium">
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Sign in to manage your band's schedule and rehearsal times.
          </p>
        </div>
        <SignIn
          fallbackRedirectUrl="/studio"
          signUpFallbackRedirectUrl="/studio"
        />
      </div>
      <div className="hidden lg:block relative h-full w-full">
        <Image
          alt="Mountains"
          src="/pexels.jpg"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 w-full h-full dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
