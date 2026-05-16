import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/notes") ||
    pathname.startsWith("/api/notes") ||
    pathname.startsWith("/api/insights");

  // NextAuth v5 cookie names
  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token") ||
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  if (isProtectedRoute && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL("/notes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/notes/:path*",
    "/api/notes/:path*",
    "/api/insights/:path*",
    "/login",
    "/signup",
  ],
};