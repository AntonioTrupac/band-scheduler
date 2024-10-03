import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/studio(.*)']);

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth();
  const pathname = req.nextUrl.pathname;
  const publicMetadata = sessionClaims?.publicMetadata || {};
  const role = (publicMetadata as { role: string }).role;
  const studioId = (publicMetadata as { studioId: string }).studioId;
  console.log('Middleware processing:', pathname);

  if (!userId && isProtectedRoute(req)) {
    console.log('Redirecting unauthenticated user to sign-in');
    // Redirect unauthenticated users to sign-in
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = '/sign-in';
    return NextResponse.redirect(signInUrl);
  }

  if (userId) {
    if (['/', '/sign-up', '/invitation'].includes(pathname)) {
      console.log('Redirecting authenticated user to /studio');
      // Redirect authenticated users to '/studio'
      const studioUrl = req.nextUrl.clone();
      studioUrl.pathname = '/studio';
      return NextResponse.redirect(studioUrl);
    }

    if (pathname === '/studio' && role !== 'admin') {
      console.log('Redirecting non-admin user to studio');
      const userStudioUrl = req.nextUrl.clone();
      userStudioUrl.pathname = `/studio/${studioId}`;
      return NextResponse.redirect(userStudioUrl);
    }

    // Protect '/studio/create' from non-admin users
    if (pathname.startsWith('/studio/create') && role !== 'admin') {
      console.log('Unauthorized access to /studio/create');
      const unauthorizedUrl = req.nextUrl.clone();
      unauthorizedUrl.pathname = '/unauthorized';
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
