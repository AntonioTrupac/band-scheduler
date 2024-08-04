import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/studio(.*)']);

export default clerkMiddleware(
  (auth, req) => {
    const pathname = req.nextUrl.pathname;

    if (!auth().userId && isProtectedRoute(req)) {
      // Add custom logic to run before redirecting
      return auth().redirectToSignIn({ returnBackUrl: req.url });
    }

    if (auth().userId && (pathname === '/' || pathname === '/sign-up')) {
      const url = req.nextUrl.clone();
      url.pathname = '/studio';
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  // { debug: true },
);

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
