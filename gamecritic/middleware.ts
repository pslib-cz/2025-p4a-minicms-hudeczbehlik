import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    const hasToken =
      req.cookies.has("authjs.session-token") ||
      req.cookies.has("__Secure-authjs.session-token") ||
      req.cookies.has("next-auth.session-token") ||
      req.cookies.has("__Secure-next-auth.session-token");

    if (!hasToken) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      // Use relative path so login can safely redirect back.
      loginUrl.searchParams.set(
        "callbackUrl",
        `${req.nextUrl.pathname}${req.nextUrl.search}`,
      );

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

/*
  Legacy NextAuth middleware wrapper replaced by a cookie guard to keep
  edge runtime free of Prisma adapter dependencies.
*/
