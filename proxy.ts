import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) return NextResponse.next();

  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
