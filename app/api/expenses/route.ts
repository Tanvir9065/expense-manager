import { NextRequest } from "next/server";
import { listExpenses, insertExpense } from "@/lib/db";
import { handle, readJson } from "@/lib/route";
import { dateOf, parseNewEntry } from "@/lib/validate";

// GET /api/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD  (from inclusive, to exclusive)
export function GET(request: NextRequest) {
  return handle(request, async () => {
    const params = request.nextUrl.searchParams;
    return listExpenses(dateOf(params.get("from")), dateOf(params.get("to")));
  });
}

export function POST(request: NextRequest) {
  return handle(request, async () => {
    const input = parseNewEntry(await readJson(request));
    return insertExpense(input);
  });
}
