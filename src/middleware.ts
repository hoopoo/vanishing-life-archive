import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE === "1";

const PUBLIC_PREFIXES = [
  "/public-preview",
  "/api/export/bundle",
  "/api/export/markdown",
];

const BLOCKED_PREFIXES = [
  "/videos",
  "/clusters",
  "/article-studio",
  "/export",
  "/run",
  "/seeds",
  "/api/youtube",
  "/api/videos",
  "/api/mock",
  "/api/settings",
  "/api/seeds",
  "/api/clusters",
  "/api/article-drafts",
  "/api/field-notes",
  "/api/stats",
];

export function middleware(request: NextRequest) {
  if (!PUBLIC_SITE) return NextResponse.next();

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.rewrite(new URL("/public-preview", request.url));
  }

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (BLOCKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/public-preview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
