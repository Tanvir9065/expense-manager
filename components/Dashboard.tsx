"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CATEGORIES,
  currentMonth,
  deleteExpense,
  fetchExpenses,
  formatDate,
  formatMoney,
  formatMonth,
  isValidMonth,
  shiftMonth,
  type Expense,
} from "@/lib/expenses";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const month = isValidMonth(monthParam) ? monthParam : currentMonth();

  const [entries, setEntries] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await fetchExpenses(month));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Data load nahi ho paya.");
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
    return Object.entries(totals);
  }, [entries]);

  function goToMonth(delta: number) {
    router.replace(`/?month=${shiftMonth(month, delta)}`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Ye entry delete karein?")) return;
    setError("");
    try {
      await deleteExpense(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete nahi ho paya.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Month switcher */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goToMonth(-1)}
          aria-label="Pichla mahina"
          className="h-10 w-10 rounded-lg border border-zinc-200 bg-white text-lg text-zinc-600 active:bg-zinc-100"
        >
          ‹
        </button>
        <h1 className="text-base font-semibold">{formatMonth(month)}</h1>
        <button
          onClick={() => goToMonth(1)}
          aria-label="Agla mahina"
          className="h-10 w-10 rounded-lg border border-zinc-200 bg-white text-lg text-zinc-600 active:bg-zinc-100"
        >
          ›
        </button>
      </div>

      {/* Total kharcha */}
      <section className="rounded-2xl bg-indigo-600 p-5 text-white">
        <p className="text-sm text-indigo-100">Is mahine ka total kharcha</p>
        <p className="mt-1 text-4xl font-bold tracking-tight">
          {loading ? "…" : formatMoney(expenseTotal)}
        </p>
      </section>

      {/* Income aur balance */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">Income mili</p>
          <p className="mt-1 text-xl font-bold text-indigo-600">
            {loading ? "…" : formatMoney(incomeTotal)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <p className="text-xs text-zinc-500">Bacha hua</p>
          <p className="mt-1 text-xl font-bold">
            {loading ? "…" : (balance < 0 ? "-" : "") + formatMoney(Math.abs(balance))}
          </p>
        </div>
      </section>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-10 text-center text-sm text-zinc-500">Load ho raha hai…</p>
      ) : (
        <>
          {/* Category summary (sirf kharcha) */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-500">Kharcha category-wise</h2>
            <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
              {categoryTotals.map(([category, amount]) => {
                const pct = expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm">
                      <span>{category}</span>
                      <span className="font-medium">{formatMoney(amount)}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Latest entries */}
          <section>
            <h2 className="mb-2 text-sm font-semibold text-zinc-500">Latest entries</h2>
            {entries.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-500">
                Abhi koi expense nahi hai
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white">
                {entries.map((e) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {e.category}
                        {e.type === "income" && (
                          <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-normal text-indigo-600">
                            Income
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {formatDate(e.date)}
                        {e.note ? ` · ${e.note}` : ""}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        e.type === "income" ? "text-indigo-600" : ""
                      }`}
                    >
                      {e.type === "income" ? "+" : "-"}
                      {formatMoney(e.amount)}
                    </p>
                    <button
                      onClick={() => handleDelete(e.id)}
                      aria-label="Delete entry"
                      className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:text-red-600 active:bg-red-50"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
