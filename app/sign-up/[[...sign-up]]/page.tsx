import { SignUp } from '@clerk/nextjs';

import Image from 'next/image';

export default function SignUpPage() {
  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-dvh">
      <div className="flex items-center justify-center py-12">
        <SignUp
          fallbackRedirectUrl="/studio"
          signInFallbackRedirectUrl="/studio"
        />
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/placeholder.svg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
