import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  authConfigured,
  checkPin,
  createSessionToken,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Server is not configured. Set the APP_PIN and AUTH_SECRET environment variables." },
      { status: 500 }
    );
  }

  let pin = "";
  try {
    const body = await request.json();
    if (typeof body?.pin === "string") pin = body.pin;
  } catch {
    // fall through with an empty pin
  }

  if (!(await checkPin(pin))) {
    // A short delay makes guessing the PIN slow
    await new Promise((resolve) => setTimeout(resolve, 700));
    return NextResponse.json({ error: "Incorrect PIN." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
