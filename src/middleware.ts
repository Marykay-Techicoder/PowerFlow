import { NextRequest, NextResponse } from "next/server";

/**
 * Route Protection Middleware
 *
 * Protected routes: /dashboard/*, /customer/*
 * Auth routes: /login, /register
 *
 * Better Auth stores the session token in the "better-auth.session_token" cookie.
 * We check for its presence here to gate route access without hitting the DB.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionCookie =
    req.cookies.get("better-auth.session_token")?.value ||
    req.cookies.get("__Secure-better-auth.session_token")?.value;

  const isAuthenticated = Boolean(sessionCookie);

  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/customer");

  const isAuthRoute =
    pathname === "/login" || pathname === "/register";

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static assets, Next internals, and the Better Auth API
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
