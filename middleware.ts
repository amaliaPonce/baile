import { NextRequest, NextResponse } from "next/server";

import { PROFESSOR_AUTH_COOKIE } from "@/lib/professor-auth";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    const hasAccess =
      request.cookies.get(PROFESSOR_AUTH_COOKIE)?.value === "ok";

    if (!hasAccess) {
      const url = request.nextUrl.clone();
      url.pathname = "/profesor";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
