"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  currentMonth,
  deleteExpense,
  fetchExpenses,
  formatDayLabel,
  formatMoney,
  formatMonth,
  isValidMonth,
  shiftMonth,
  type Expense,
} from "@/lib/expenses";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
    </svg>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();

  const [entries, setEntries] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await fetchExpenses(month));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your data.");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const { expenseTotal, incomeTotal } = useMemo(() => {
    let expenseTotal = 0;
    let incomeTotal = 0;
    for (const e of entries) {
      if (e.type === "income") incomeTotal += e.amount;
      else expenseTotal += e.amount;
    }
    return { expenseTotal, incomeTotal };
  }, [entries]);

  const balance = incomeTotal - expenseTotal;

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const c of CATEGORIES.expense) totals[c] = 0;
    for (const e of entries) {
      if (e.type === "expense") totals[e.category] = (totals[e.category] ?? 0) + e.amount;
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  // Entries grouped by date, newest first (entries are already sorted)
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of entries) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return Array.from(map.entries());
  }, [entries]);

  function goToMonth(delta: number) {
    router.replace(`/?month=${shiftMonth(month, delta)}`);
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      await deleteExpense(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete this entry.");
    } finally {
      setConfirmId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + month switcher */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Overview</p>
          <h1 className="text-xl font-semibold tracking-tight">{formatMonth(month)}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95"
          >
            <Chevron direction="left" />
          </button>
          <button
            onClick={() => goToMonth(1)}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </header>

      {/* Summary card */}
      {loading ? (
        <Skeleton className="h-44" />
      ) : (
        <section className="rounded-3xl bg-linear-to-br from-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-600/20">
          <p className="text-sm text-indigo-100">Spent this month</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{formatMoney(expenseTotal)}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-xs text-indigo-100">Income</p>
              <p className="mt-0.5 text-base font-semibold">{formatMoney(incomeTotal)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3">
              <p className="text-xs text-indigo-100">Balance</p>
              <p className="mt-0.5 text-base font-semibold">
                {(balance < 0 ? "-" : "") + formatMoney(Math.abs(balance))}
              </p>
            </div>
          </div>
        </section>
      )}

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-52" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <>
          {/* Spending by category */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Spending by category</h2>
            <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-sm">
              {categoryTotals.map(([category, amount]) => {
                const pct = expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-700">
                        <span className="text-base">{CATEGORY_ICONS[category]}</span>
                        {category}
                      </span>
                      <span className="font-medium tabular-nums">{formatMoney(amount)}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Transactions */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Transactions</h2>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
                <span className="text-4xl">🧾</span>
                <p className="mt-3 text-sm font-medium text-slate-900">No expenses yet</p>
                <p className="mt-1 text-sm text-slate-500">Nothing recorded for this month.</p>
                <Link
                  href="/add"
                  className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm active:scale-95"
                >
                  Add your first entry
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {groups.map(([date, items]) => (
                  <div key={date}>
                    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                      {formatDayLabel(date)}
                    </p>
                    <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
                      {items.map((e) => {
                        const isIncome = e.type === "income";
                        const confirming = confirmId === e.id;
                        return (
                          <li key={e.id} className="flex items-center gap-3 px-4 py-3.5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-lg">
                              {CATEGORY_ICONS[e.category] ?? "📦"}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{e.category}</p>
                              <p className="truncate text-xs text-slate-500">
                                {e.note || (isIncome ? "Income" : "Expense")}
                              </p>
                            </div>

                            {confirming ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setConfirmId(null)}
                                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 active:bg-slate-100"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDelete(e.id)}
                                  className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white active:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : (
                              <>
                                <p
                                  className={`text-sm font-semibold tabular-nums ${
                                    isIncome ? "text-emerald-600" : "text-slate-900"
                                  }`}
                                >
                                  {isIncome ? "+" : "-"}
                                  {formatMoney(e.amount)}
                                </p>
                                <button
                                  onClick={() => setConfirmId(e.id)}
                                  aria-label="Delete entry"
                                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-red-50 hover:text-red-600 active:bg-red-50"
                                >
                                  <TrashIcon />
                                </button>
                              </>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
