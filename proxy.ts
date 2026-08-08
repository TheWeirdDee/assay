/**
 * Optimistic auth gate (Next 16 renamed `middleware.ts` to `proxy.ts`). Only checks cookie presence --
 * no DB round trip here, per Next's guidance (this runs on every request including prefetches). The
 * real, authoritative check is lib/auth/dal.ts's requireUser(), which every protected page/action calls.
 */
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "assay_session";

export default function proxy(req: NextRequest) {
  const isProtected = req.nextUrl.pathname.startsWith("/app");
  if (!isProtected) return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
