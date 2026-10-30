import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, isValidSession } from "./auth";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Wraps an API handler: checks the session, then turns results and errors into JSON.
export async function handle(
  request: NextRequest,
  fn: () => Promise<unknown>
): Promise<Response> {
  const signedIn = await isValidSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!signedIn) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  try {
    const result = await fn();
    if (result instanceof Response) return result;
    return NextResponse.json(result ?? { ok: true });
  } catch (e) {
    if (e instanceof ApiError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Invalid request body.");
  }
}
