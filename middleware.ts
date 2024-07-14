import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/studio(.*)']);

export default clerkMiddleware(
  (auth, req) => {
    if (!auth().userId && isProtectedRoute(req)) {
      // Add custom logic to run before redirecting
      return auth().redirectToSignIn({ returnBackUrl: req.url });
    }
  },
  // { debug: true },
);

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
