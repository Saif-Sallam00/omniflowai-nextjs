import { NextResponse, type NextRequest, type NextProxy, type ProxyConfig } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const proxy: NextProxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/admin/auth", request.url));
  }

  return NextResponse.next();
};

export const config: ProxyConfig = {
  matcher: ["/admin/:path*"],
};
