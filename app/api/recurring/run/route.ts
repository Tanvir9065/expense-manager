import { NextRequest } from "next/server";
import { runRecurring } from "@/lib/db";
import { handle, readJson } from "@/lib/route";
import { ApiError } from "@/lib/route";
import { dateOf } from "@/lib/validate";

// Body: { today: "YYYY-MM-DD" } (the browser's local date)
export function POST(request: NextRequest) {
  return handle(request, async () => {
    const body = (await readJson(request)) as { today?: unknown } | null;
    if (!body || typeof body !== "object") throw new ApiError(400, "Invalid request body.");
    const created = await runRecurring(dateOf(body.today));
    return { created };
  });
}
