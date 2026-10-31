// Browser-side helpers. Every function calls our own /api routes.
import { clearOfflineData } from "./offline";
import type {
  EntryInput,
  Expense,
  Recurring,
  RecurringInput,
  Settings,
} from "./utils";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      ...init,
      headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }

  if (response.status === 401 && !url.startsWith("/api/login")) {
    await clearOfflineData();
    window.location.href = "/login";
    throw new Error("Please sign in.");
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Something went wrong.");
  return data as T;
}

const send = (method: string, body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});

/* ---------- Session ---------- */

export const login = (pin: string) => request<{ ok: true }>("/api/login", send("POST", { pin }));
export const logout = () => request<{ ok: true }>("/api/logout", { method: "POST" });

/* ---------- Expenses ---------- */

// from is inclusive, to is exclusive ("YYYY-MM-DD")
export const fetchExpenses = (from: string, to: string) =>
  request<Expense[]>(`/api/expenses?from=${from}&to=${to}`);

export const fetchExpense = (id: string) => request<Expense>(`/api/expenses/${id}`);

export const addExpense = (input: EntryInput) =>
  request<Expense>("/api/expenses", send("POST", input));

export const updateExpense = (id: string, input: EntryInput) =>
  request<Expense>(`/api/expenses/${id}`, send("PATCH", input));

export const deleteExpense = (id: string) =>
  request<{ ok: true }>(`/api/expenses/${id}`, { method: "DELETE" });

// Used by "Undo": puts the deleted entry back exactly as it was
export const restoreExpense = (entry: Expense) =>
  request<Expense>("/api/expenses", send("POST", entry));

/* ---------- Settings ---------- */

export const fetchSettings = () => request<Settings>("/api/settings");

export const saveSettings = (patch: Partial<Settings>) =>
  request<Settings>("/api/settings", send("PUT", patch));

/* ---------- Recurring ---------- */

export const fetchRecurring = () => request<Recurring[]>("/api/recurring");

export const addRecurring = (input: RecurringInput) =>
  request<Recurring>("/api/recurring", send("POST", input));

export const updateRecurring = (
  id: string,
  patch: { active?: boolean; last_run?: string | null }
) => request<Recurring>(`/api/recurring/${id}`, send("PATCH", patch));

export const deleteRecurring = (id: string) =>
  request<{ ok: true }>(`/api/recurring/${id}`, { method: "DELETE" });

// Creates any entries that are due today or earlier
export const runRecurring = (today: string) =>
  request<{ created: number }>("/api/recurring/run", send("POST", { today }));
