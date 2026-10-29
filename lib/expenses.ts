import { supabase } from "./supabase";

export type EntryType = "expense" | "income";

export const CATEGORIES: Record<EntryType, readonly string[]> = {
  expense: ["Food", "Travel", "Bills", "Shopping", "Other"],
  income: ["Salary", "Business", "Gift", "Other"],
};

export type Expense = {
  id: string;
  type: EntryType;
  amount: number;
  category: string;
  note: string | null;
  date: string; // "YYYY-MM-DD"
  created_at: string;
};

export type NewExpense = {
  type: EntryType;
  amount: number;
  category: string;
  date: string;
  note?: string;
};

/* ---------- Date helpers (local time, "YYYY-MM-DD" / "YYYY-MM") ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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

export function formatMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function formatMoney(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

/* ---------- Validation ---------- */

// Amount string ko valid positive number mein badalta hai, warna error throw karta hai.
export function parseAmount(raw: string): number {
  const value = Number(raw.trim());
  if (raw.trim() === "" || !Number.isFinite(value)) {
    throw new Error("Amount ek valid number hona chahiye.");
  }
  if (value <= 0) {
    throw new Error("Amount 0 se zyada hona chahiye.");
  }
  return Math.round(value * 100) / 100;
}

/* ---------- Supabase functions ---------- */

// Ek mahine ki saari entries (expense + income), newest pehle.
export async function fetchExpenses(month: string): Promise<Expense[]> {
  const start = `${month}-01`;
  const end = `${shiftMonth(month, 1)}-01`;

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", start)
    .lt("date", end)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    ...row,
    type: row.type === "income" ? "income" : "expense",
    amount: Number(row.amount),
  })) as Expense[];
}

export async function addExpense(expense: NewExpense): Promise<void> {
  const { error } = await supabase.from("expenses").insert({
    type: expense.type,
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    note: expense.note?.trim() ? expense.note.trim() : null,
  });

  if (error) throw new Error(error.message);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
