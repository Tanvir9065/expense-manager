/* ---------- Types ---------- */

export type EntryType = "expense" | "income";
export type Categories = Record<EntryType, string[]>;

export type Expense = {
  id: string;
  type: EntryType;
  amount: number;
  category: string;
  note: string | null;
  date: string; // "YYYY-MM-DD"
  created_at: string;
  recurring_id: string | null;
};

export type EntryInput = {
  type: EntryType;
  amount: number;
  category: string;
  date: string;
  note?: string | null;
};

export type Recurring = {
  id: string;
  type: EntryType;
  amount: number;
  category: string;
  note: string | null;
  day_of_month: number;
  start_date: string;
  last_run: string | null;
  active: boolean;
  created_at: string;
};

export type RecurringInput = {
  type: EntryType;
  amount: number;
  category: string;
  note?: string | null;
  day_of_month: number;
  start_date: string;
};

// How many entries each category has, per type: { expense: { Food: 12 }, income: { Salary: 3 } }
export type CategoryUsage = Record<EntryType, Record<string, number>>;

export type Settings = {
  budget: number | null;
  categories: Categories;
};

/* ---------- Categories ---------- */

export const DEFAULT_CATEGORIES: Categories = {
  expense: ["Food", "Travel", "Bills", "Shopping", "Other"],
  income: ["Salary", "Business", "Gift", "Other"],
};

export const DEFAULT_SETTINGS: Settings = {
  budget: null,
  categories: DEFAULT_CATEGORIES,
};

/* ---------- Dates (local time, "YYYY-MM-DD" / "YYYY-MM") ---------- */

export const pad = (n: number) => String(n).padStart(2, "0");

function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayString(): string {
  return toDateString(new Date());
}

export function currentMonth(): string {
  return todayString().slice(0, 7);
}

export function isValidMonth(value: string | null | undefined): value is string {
  return !!value && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function monthShort(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "short" });
}

// "Today", "Yesterday", or "Tue, 28 Oct"
export function formatDayLabel(date: string): string {
  const now = new Date();
  if (date === toDateString(now)) return "Today";
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (date === toDateString(yesterday)) return "Yesterday";
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ---------- Money ---------- */

export function formatMoney(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

// 1250 -> "1.3k", 150000 -> "1.5L"
export function formatCompact(n: number): string {
  const trim = (v: number) => String(Math.round(v * 10) / 10);
  if (n >= 10000000) return `${trim(n / 10000000)}Cr`;
  if (n >= 100000) return `${trim(n / 100000)}L`;
  if (n >= 1000) return `${trim(n / 1000)}k`;
  return String(Math.round(n));
}

// Converts the amount string to a valid positive number, or throws an error.
export function parseAmount(raw: string): number {
  const value = Number(raw.trim());
  if (raw.trim() === "" || !Number.isFinite(value)) {
    throw new Error("Please enter a valid amount.");
  }
  if (value <= 0) {
    throw new Error("Amount must be greater than 0.");
  }
  return Math.round(value * 100) / 100;
}
