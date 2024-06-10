import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/studio(.*)']);

export default clerkMiddleware((auth, req) => {
  console.log('RUNNING MIDDLEWARE 1');
  if (!auth().userId && isProtectedRoute(req)) {
    console.log('REQ URL', req.url);
    // Add custom logic to run before redirecting
    console.log('RUNNING MIDDLEWARE 2');
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
