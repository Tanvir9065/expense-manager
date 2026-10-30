import { ApiError } from "./route";
import type { Categories, EntryType } from "./utils";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function obj(body: unknown): Record<string, unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "Invalid request body.");
  }
  return body as Record<string, unknown>;
}

export function idOf(value: unknown): string {
  if (typeof value !== "string" || !UUID_RE.test(value)) {
    throw new ApiError(400, "Invalid id.");
  }
  return value;
}

export function dateOf(value: unknown): string {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    throw new ApiError(400, "Date must look like YYYY-MM-DD.");
  }
  const [y, m, d] = value.split("-").map(Number);
  const real = new Date(Date.UTC(y, m - 1, d));
  if (real.getUTCFullYear() !== y || real.getUTCMonth() !== m - 1 || real.getUTCDate() !== d) {
    throw new ApiError(400, "That date does not exist.");
  }
  return value;
}

function amountOf(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    throw new ApiError(400, "Amount must be a number greater than 0.");
  }
  if (n > 1_000_000_000) throw new ApiError(400, "Amount is too large.");
  return Math.round(n * 100) / 100;
}

function categoryOf(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > 40) {
    throw new ApiError(400, "Please choose a category.");
  }
  return value.trim();
}

function typeOf(value: unknown): EntryType {
  if (value !== "expense" && value !== "income") {
    throw new ApiError(400, "Type must be expense or income.");
  }
  return value;
}

function noteOf(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || value.length > 200) {
    throw new ApiError(400, "Note must be 200 characters or fewer.");
  }
  return value.trim() || null;
}

/* ---------- Expenses ---------- */

export type EntryFields = {
  type?: EntryType;
  amount?: number;
  category?: string;
  date?: string;
  note?: string | null;
};

// partial = true for PATCH: only the fields that are present are checked.
export function parseEntry(body: unknown, partial: boolean): EntryFields {
  const b = obj(body);
  const out: EntryFields = {};
  if (!partial || "type" in b) out.type = typeOf(b.type);
  if (!partial || "amount" in b) out.amount = amountOf(b.amount);
  if (!partial || "category" in b) out.category = categoryOf(b.category);
  if (!partial || "date" in b) out.date = dateOf(b.date);
  if ("note" in b) out.note = noteOf(b.note);
  return out;
}

// For POST. The optional id / created_at / recurring_id let "Undo delete" restore a row exactly.
export function parseNewEntry(body: unknown) {
  const b = obj(body);
  const out: EntryFields & { id?: string; created_at?: string; recurring_id?: string | null } =
    parseEntry(body, false);
  if (b.id !== undefined) out.id = idOf(b.id);
  if (typeof b.created_at === "string" && !Number.isNaN(Date.parse(b.created_at))) {
    out.created_at = b.created_at;
  }
  if (b.recurring_id) out.recurring_id = idOf(b.recurring_id);
  return out;
}

/* ---------- Recurring ---------- */

export type RecurringFields = EntryFields & {
  day_of_month?: number;
  start_date?: string;
  active?: boolean;
  last_run?: string | null;
};

export function parseRecurring(body: unknown, partial: boolean): RecurringFields {
  const b = obj(body);
  const out: RecurringFields = parseEntry(
    // recurring rules have start_date instead of date
    { ...b, date: "2000-01-01" },
    partial
  );
  delete out.date;

  if (!partial || "day_of_month" in b) {
    const day = Number(b.day_of_month);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new ApiError(400, "Day of month must be between 1 and 31.");
    }
    out.day_of_month = day;
  }
  if (!partial || "start_date" in b) out.start_date = dateOf(b.start_date);
  if ("active" in b) {
    if (typeof b.active !== "boolean") throw new ApiError(400, "Invalid value for active.");
    out.active = b.active;
  }
  if ("last_run" in b) out.last_run = b.last_run === null ? null : dateOf(b.last_run);
  return out;
}

/* ---------- Settings ---------- */

function namesOf(value: unknown): string[] {
  if (!Array.isArray(value)) throw new ApiError(400, "Categories must be a list.");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") throw new ApiError(400, "Category names must be text.");
    const name = item.trim();
    if (!name || name.length > 24) {
      throw new ApiError(400, "Category names must be 1 to 24 characters.");
    }
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  if (out.length < 1) throw new ApiError(400, "Keep at least one category.");
  if (out.length > 30) throw new ApiError(400, "That is too many categories.");
  return out;
}

export function parseSettingsPatch(body: unknown): {
  budget?: number | null;
  categories?: Categories;
} {
  const b = obj(body);
  const out: { budget?: number | null; categories?: Categories } = {};

  if ("budget" in b) {
    if (b.budget === null) {
      out.budget = null;
    } else {
      const n = Number(b.budget);
      if (!Number.isFinite(n) || n <= 0 || n > 1_000_000_000) {
        throw new ApiError(400, "Budget must be a number greater than 0.");
      }
      out.budget = Math.round(n * 100) / 100;
    }
  }

  if ("categories" in b) {
    const c = obj(b.categories);
    out.categories = { expense: namesOf(c.expense), income: namesOf(c.income) };
  }
  return out;
}
