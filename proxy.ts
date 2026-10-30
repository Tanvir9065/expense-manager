import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

// Sends signed-out visitors to /login. API routes check the session themselves.
export async function proxy(request: NextRequest) {
  const signedIn = await isValidSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (signedIn) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|login|favicon.ico|icon.svg|icon.png|apple-icon.png|manifest.webmanifest|icons).*)",
  ],
};
