import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/studio(.*)']);

// export default clerkMiddleware((auth, req) => {
//   const pathname = req.nextUrl.pathname;
//   const sessionClaims = auth().sessionClaims;
//   const publicMetadata = sessionClaims?.publicMetadata;
//   const role = (publicMetadata as { userType: string }).userType as string;
//   console.log('role', role);

// if (!auth().userId && isProtectedRoute(req)) {
//   // Add custom logic to run before redirecting
//   return auth().redirectToSignIn({ returnBackUrl: req.url });
// }

//   if (auth().userId && (pathname === '/' || pathname === '/sign-up')) {
//     const url = req.nextUrl.clone();
//     url.pathname = '/studio';
//     return NextResponse.redirect(url);
//   }

//   return NextResponse.next();
// });

export default clerkMiddleware((auth, req) => {
  const { userId, sessionClaims } = auth();
  const pathname = req.nextUrl.pathname;
  const publicMetadata = sessionClaims?.publicMetadata || {};
  const role = (publicMetadata as { role: string }).role;

  if (!auth().userId && isProtectedRoute(req)) {
    return auth().redirectToSignIn({ returnBackUrl: req.url });
  }

  if (userId) {
    if (pathname === '/' || pathname === '/sign-up') {
      // Redirect authenticated users to '/studio'
      const url = req.nextUrl.clone();
      url.pathname = '/studio';
      return NextResponse.redirect(url);
    }

    // Protect '/studio/create' from non-admin users
    if (pathname.startsWith('/studio/create') && role !== 'admin') {
      // Redirect to unauthorized page
      const url = req.nextUrl.clone();
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
