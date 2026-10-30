import { NextRequest } from "next/server";
import { deleteExpense, getExpense, updateExpense } from "@/lib/db";
import { ApiError, handle, readJson } from "@/lib/route";
import { idOf, parseEntry } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export function GET(request: NextRequest, { params }: Context) {
  return handle(request, async () => getExpense(idOf((await params).id)));
}

export function PATCH(request: NextRequest, { params }: Context) {
  return handle(request, async () => {
    const id = idOf((await params).id);
    const patch = parseEntry(await readJson(request), true);
    if (Object.keys(patch).length === 0) throw new ApiError(400, "Nothing to update.");
    return updateExpense(id, patch);
  });
}

export function DELETE(request: NextRequest, { params }: Context) {
  return handle(request, async () => {
    await deleteExpense(idOf((await params).id));
  });
}
