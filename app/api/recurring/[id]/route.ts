import { NextRequest } from "next/server";
import { deleteRecurring, updateRecurring } from "@/lib/db";
import { ApiError, handle, readJson } from "@/lib/route";
import { idOf, parseRecurring } from "@/lib/validate";

type Context = { params: Promise<{ id: string }> };

export function PATCH(request: NextRequest, { params }: Context) {
  return handle(request, async () => {
    const id = idOf((await params).id);
    const patch = parseRecurring(await readJson(request), true);
    if (Object.keys(patch).length === 0) throw new ApiError(400, "Nothing to update.");
    return updateRecurring(id, patch);
  });
}

export function DELETE(request: NextRequest, { params }: Context) {
  return handle(request, async () => {
    await deleteRecurring(idOf((await params).id));
  });
}
