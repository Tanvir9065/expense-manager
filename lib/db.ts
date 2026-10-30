import "server-only";
import { getSupabase } from "./supabase";
import { ApiError } from "./route";
import type { EntryFields, RecurringFields } from "./validate";
import {
  DEFAULT_CATEGORIES,
  daysInMonth,
  pad,
  shiftMonth,
  type Categories,
  type Expense,
  type Recurring,
  type Settings,
} from "./utils";

const PAGE_SIZE = 1000; // Supabase returns at most 1000 rows per request

function toExpense(row: Record<string, unknown>): Expense {
  return {
    ...row,
    type: row.type === "income" ? "income" : "expense",
    amount: Number(row.amount),
    recurring_id: (row.recurring_id as string | null) ?? null,
  } as Expense;
}

function toRecurring(row: Record<string, unknown>): Recurring {
  return {
    ...row,
    type: row.type === "income" ? "income" : "expense",
    amount: Number(row.amount),
  } as Recurring;
}

/* ---------- Expenses ---------- */

// All entries with from <= date < to, newest first.
export async function listExpenses(from: string, to: string): Promise<Expense[]> {
  const rows: Expense[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await getSupabase()
      .from("expenses")
      .select("*")
      .gte("date", from)
      .lt("date", to)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .order("id")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    rows.push(...(data ?? []).map(toExpense));
    if (!data || data.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function getExpense(id: string): Promise<Expense> {
  const { data, error } = await getSupabase().from("expenses").select("*").eq("id", id);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new ApiError(404, "Entry not found.");
  return toExpense(data[0]);
}

export async function insertExpense(input: Record<string, unknown>): Promise<Expense> {
  const { data, error } = await getSupabase().from("expenses").insert(input).select();
  if (error) throw new Error(error.message);
  return toExpense((data ?? [])[0]);
}

export async function updateExpense(id: string, patch: EntryFields): Promise<Expense> {
  const { data, error } = await getSupabase()
    .from("expenses")
    .update(patch)
    .eq("id", id)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new ApiError(404, "Entry not found.");
  return toExpense(data[0]);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await getSupabase().from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ---------- Settings (budget + categories) ---------- */

function validCategories(value: unknown): value is Categories {
  const c = value as Categories | null;
  return (
    !!c &&
    Array.isArray(c.expense) &&
    Array.isArray(c.income) &&
    c.expense.length > 0 &&
    c.income.length > 0
  );
}

export async function getSettings(): Promise<Settings> {
  const { data, error } = await getSupabase().from("settings").select("key,value");
  if (error) throw new Error(error.message);

  const map = new Map((data ?? []).map((r) => [r.key as string, r.value as unknown]));
  const budget = map.get("budget");
  const categories = map.get("categories");

  return {
    budget: typeof budget === "number" ? budget : null,
    categories: validCategories(categories) ? categories : DEFAULT_CATEGORIES,
  };
}

export async function saveSettings(patch: {
  budget?: number | null;
  categories?: Categories;
}): Promise<Settings> {
  const db = getSupabase();

  if (patch.budget === null) {
    const { error } = await db.from("settings").delete().eq("key", "budget");
    if (error) throw new Error(error.message);
  }

  const rows: { key: string; value: unknown }[] = [];
  if (typeof patch.budget === "number") rows.push({ key: "budget", value: patch.budget });
  if (patch.categories) rows.push({ key: "categories", value: patch.categories });

  if (rows.length > 0) {
    const { error } = await db.from("settings").upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);
  }
  return getSettings();
}

/* ---------- Recurring entries ---------- */

export async function listRecurring(): Promise<Recurring[]> {
  const { data, error } = await getSupabase()
    .from("recurring")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id");
  if (error) throw new Error(error.message);
  return (data ?? []).map(toRecurring);
}

export async function createRecurring(
  input: Record<string, unknown>
): Promise<Recurring> {
  const { data, error } = await getSupabase().from("recurring").insert(input).select();
  if (error) throw new Error(error.message);
  return toRecurring((data ?? [])[0]);
}

export async function updateRecurring(
  id: string,
  patch: RecurringFields
): Promise<Recurring> {
  const { data, error } = await getSupabase()
    .from("recurring")
    .update(patch)
    .eq("id", id)
    .select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new ApiError(404, "Recurring entry not found.");
  return toRecurring(data[0]);
}

export async function deleteRecurring(id: string): Promise<void> {
  const { error } = await getSupabase().from("recurring").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Dates on which a rule should have produced an entry, up to and including `today`.
function dueDates(rule: Recurring, today: string): string[] {
  const out: string[] = [];
  const lastMonth = today.slice(0, 7);
  let month = rule.start_date.slice(0, 7);

  while (month <= lastMonth) {
    const day = Math.min(rule.day_of_month, daysInMonth(month));
    const date = `${month}-${pad(day)}`;
    const afterLastRun = !rule.last_run || date > rule.last_run;
    if (date >= rule.start_date && date <= today && afterLastRun) out.push(date);
    month = shiftMonth(month, 1);
  }
  return out;
}

// Creates the entries that are due. Safe to call repeatedly: a unique index on
// (recurring_id, date) stops duplicates, and last_run stops deleted entries from coming back.
export async function runRecurring(today: string): Promise<number> {
  const rules = (await listRecurring()).filter((r) => r.active);
  if (rules.length === 0) return 0;

  const rows = rules.flatMap((rule) =>
    dueDates(rule, today).map((date) => ({
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      note: rule.note,
      date,
      recurring_id: rule.id,
    }))
  );

  const db = getSupabase();
  if (rows.length > 0) {
    const { error } = await db
      .from("expenses")
      .upsert(rows, { onConflict: "recurring_id,date", ignoreDuplicates: true });
    if (error) throw new Error(error.message);
  }

  const { error } = await db
    .from("recurring")
    .update({ last_run: today })
    .in(
      "id",
      rules.map((r) => r.id)
    );
  if (error) throw new Error(error.message);

  return rows.length;
}

/* ---------- CSV export ---------- */

function csvCell(value: string): string {
  // A leading = + - @ can run as a formula in Excel/Sheets, so neutralise it.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function exportCsv(): Promise<string> {
  const all = (await listExpenses("1900-01-01", "2999-12-31")).reverse();
  const lines = ["Date,Type,Category,Amount,Note"];
  for (const e of all) {
    lines.push(
      [e.date, e.type, csvCell(e.category), String(e.amount), csvCell(e.note ?? "")].join(",")
    );
  }
  return lines.join("\n") + "\n";
}
