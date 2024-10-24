import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PublicMetadata } from './lib/utils';

const isProtectedRoute = createRouteMatcher(['/studio(.*)']);
const isAdminRoute = createRouteMatcher(['/studio/create(.*)']);

// helper for redirects
const redirect = (url: string, req: Request) =>
  NextResponse.redirect(new URL(url, req.url));

// helper for logging
const log = (message: string, obj?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, obj);
  }
};

export default clerkMiddleware((auth, req) => {
  const start = Date.now(); // For performance monitoring

  try {
    const { userId, sessionClaims } = auth();
    const pathname = new URL(req.url).pathname;
    const { role, studioId } =
      (sessionClaims?.publicMetadata as PublicMetadata) || {};

    log('Middleware processing:', { pathname, userId, role, studioId });

    if (!userId && isProtectedRoute(req)) {
      log('Redirecting unauthenticated user to sign-in');
      return redirect('/sign-in', req);
    }

    // Handle authenticated users
    if (userId) {
      if (['/', '/sign-up', '/invitation'].includes(pathname)) {
        log('Redirecting authenticated user to studio');
        return redirect('/studio', req);
      }

      if (pathname === '/studio' && role !== 'admin') {
        log('Redirecting non-admin user to their studio');
        return redirect(`/studio/${studioId}`, req);
      }

      if (isAdminRoute(req) && role !== 'admin') {
        log('Blocking non-admin user from admin route');
        return redirect('/unauthorized', req);
      }
    }

    return NextResponse.next();
  } catch (error) {
    log('Middleware error:', error);
    // In case of error, allow the request to proceed and let the application handle it
    return NextResponse.next();
  } finally {
    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - start;
      log(`Middleware execution time: ${duration}ms`);
    }
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
