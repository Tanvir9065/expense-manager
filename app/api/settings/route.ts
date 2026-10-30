import { NextRequest } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";
import { handle, readJson } from "@/lib/route";
import { parseSettingsPatch } from "@/lib/validate";

export function GET(request: NextRequest) {
  return handle(request, () => getSettings());
}

// Body: { budget?: number | null, categories?: { expense: string[], income: string[] } }
export function PUT(request: NextRequest) {
  return handle(request, async () => {
    return saveSettings(parseSettingsPatch(await readJson(request)));
  });
}
