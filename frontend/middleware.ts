import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isCarsPage = request.nextUrl.pathname.startsWith("/cars");

  if (!token && isCarsPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/cars", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/cars/:path*"]
};
