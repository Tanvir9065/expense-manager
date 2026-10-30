import { NextRequest } from "next/server";
import { exportCsv } from "@/lib/db";
import { handle } from "@/lib/route";

export function GET(request: NextRequest) {
  return handle(request, async () => {
    const csv = await exportCsv();
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenses-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
