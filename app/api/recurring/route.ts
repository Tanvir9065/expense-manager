import { NextRequest } from "next/server";
import { createRecurring, listRecurring } from "@/lib/db";
import { handle, readJson } from "@/lib/route";
import { parseRecurring } from "@/lib/validate";

export function GET(request: NextRequest) {
  return handle(request, () => listRecurring());
}

export function POST(request: NextRequest) {
  return handle(request, async () => {
    return createRecurring(parseRecurring(await readJson(request), false));
  });
}
