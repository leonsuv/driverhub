import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/config";

const publicRoutes = new Set(["/", "/login", "/register"]);
const authRoutes = new Set(["/login", "/register"]);

const isApiRoute = (pathname: string) => pathname.startsWith("/api/");

const matchesRoute = (pathname: string, routes: Set<string>) =>
  Array.from(routes).some((route) => pathname === route || pathname.startsWith(`${route}/`));

const authProxy = auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (isApiRoute(pathname)) {
    return NextResponse.next();
  }

  const session = request.auth;

  if (!session?.user && !matchesRoute(pathname, publicRoutes)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", pathname + nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  if (session?.user && matchesRoute(pathname, authRoutes)) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
});

export { authProxy };
export default authProxy;
