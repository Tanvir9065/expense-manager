import { NextRequest } from "next/server";
import { categoryUsage } from "@/lib/db";
import { handle } from "@/lib/route";

// GET /api/categories -> { expense: { Food: 12, ... }, income: { Salary: 3, ... } }
export function GET(request: NextRequest) {
  return handle(request, () => categoryUsage());
}
