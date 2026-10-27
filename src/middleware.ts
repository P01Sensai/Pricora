import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept admin routes
  if (pathname.startsWith("/admin")) {
    // Allow login page and admin auth API to pass through
    if (pathname === "/admin/login" || pathname.startsWith("/api/admin/")) {
      return NextResponse.next();
    }

    const adminToken = request.cookies.get("pricora_admin_token")?.value;
    const expectedToken = process.env.ADMIN_SESSION_TOKEN || "pricora-authorized-admin-session-2026";

    // If token is missing or doesn't match, redirect to login
    if (!adminToken || adminToken !== expectedToken) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
