"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CategoryIcon from "@/components/CategoryIcon";
import TrendChart from "@/components/TrendChart";
import { useToast } from "@/components/Toast";
import { deleteExpense, fetchExpenses, restoreExpense, runRecurring } from "@/lib/api";
import { useSettings } from "@/lib/useSettings";
import {
  currentMonth,
  formatDayLabel,
  formatMoney,
  formatMonth,
  isValidMonth,
  monthShort,
  shiftMonth,
  todayString,
  type EntryType,
  type Expense,
} from "@/lib/utils";

const smallIcon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg {...smallIcon} className="h-5 w-5">
      <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...smallIcon} strokeWidth={1.8} className="h-[18px] w-[18px]">
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg {...smallIcon} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-3xl bg-subtle ${className}`} />;
}

/* Pull down at the top of the page to refresh */
function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshRef = useRef(onRefresh);

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      startY.current = window.scrollY <= 0 ? e.touches[0].clientY : null;
    };
    const onMove = (e: TouchEvent) => {
      if (startY.current === null) return;
      const distance = e.touches[0].clientY - startY.current;
      pullRef.current = distance > 0 ? Math.min(distance * 0.5, 80) : 0;
      setPull(pullRef.current);
    };
    const onEnd = async () => {
      if (startY.current === null) return;
      const triggered = pullRef.current >= 60;
      startY.current = null;
      pullRef.current = 0;
      setPull(0);
      if (triggered) {
        setRefreshing(true);
        try {
          await refreshRef.current();
        } finally {
          setRefreshing(false);
        }
      }
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  return { pull, refreshing };
}

type EntryRowProps = {
  entry: Expense;
  confirming: boolean;
  onAskDelete: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

function EntryRow({ entry, confirming, onAskDelete, onCancel, onDelete }: EntryRowProps) {
  const isIncome = entry.type === "income";

  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-subtle text-accent">
        <CategoryIcon name={entry.category} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{entry.category}</p>
        <p className="truncate text-xs text-muted">
          {entry.recurring_id ? "↻ " : ""}
          {entry.note || (isIncome ? "Income" : "Expense")}
        </p>
      </div>
    </>
  );

  if (confirming) {
    return (
      <li className="flex items-center gap-3 px-4 py-3.5">
        {body}
        <button
          onClick={onCancel}
          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted active:bg-subtle"
        >
          Cancel
        </button>
        <button
          onClick={onDelete}
          className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white active:bg-red-700"
        >
          Delete
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center">
      <Link
        href={`/edit/${entry.id}`}
        aria-label={`Edit ${entry.category} entry`}
        className="flex min-w-0 flex-1 items-center gap-3 py-3.5 pl-4"
      >
        {body}
        <p
          className={`text-sm font-semibold tabular-nums ${
            isIncome ? "text-income" : "text-ink"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatMoney(entry.amount)}
        </p>
      </Link>
      <button
        onClick={onAskDelete}
        aria-label="Delete entry"
        className="mr-2 flex h-10 w-10 items-center justify-center rounded-full text-faint transition hover:text-red-600 active:bg-err-bg"
      >
        <TrashIcon />
      </button>
    </li>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show } = useToast();
  const { settings } = useSettings();

  const monthParam = searchParams.get("month");
  const thisMonth = currentMonth();
  const month = isValidMonth(monthParam) ? monthParam : thisMonth;

  // Entries for the selected month and the 5 months before it (for the trend chart)
  const [entries, setEntries] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | EntryType>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const recurringChecked = useRef(false);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        // Create any recurring entries that are due (once per visit)
        if (!recurringChecked.current) {
          recurringChecked.current = true;
          try {
            await runRecurring(todayString());
          } catch (e) {
            console.warn("Recurring check failed:", e);
          }
        }
        setEntries(
          await fetchExpenses(`${shiftMonth(month, -5)}-01`, `${shiftMonth(month, 1)}-01`)
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load your data.");
      } finally {
        setLoading(false);
      }
    },
    [month]
  );

  useEffect(() => {
    load();
  }, [load]);

  const { pull, refreshing } = usePullToRefresh(() => load(true));

  const monthEntries = useMemo(
    () => entries.filter((e) => e.date.startsWith(month)),
    [entries, month]
  );

  const { expenseTotal, incomeTotal } = useMemo(() => {
    let expenseTotal = 0;
    let incomeTotal = 0;
    for (const e of monthEntries) {
      if (e.type === "income") incomeTotal += e.amount;
      else expenseTotal += e.amount;
    }
    return { expenseTotal, incomeTotal };
  }, [monthEntries]);

  const balance = incomeTotal - expenseTotal;
  const budget = settings.budget;

  // Spending for the last 6 months, ending at the selected month
  const trend = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => shiftMonth(month, i - 5));
    return months.map((m) => ({
      label: monthShort(m),
      active: m === month,
      value: entries
        .filter((e) => e.type === "expense" && e.date.startsWith(m))
        .reduce((sum, e) => sum + e.amount, 0),
    }));
  }, [entries, month]);

  const previousSpent = trend[4].value;
  const changePct =
    previousSpent > 0 ? Math.round(((expenseTotal - previousSpent) / previousSpent) * 100) : null;

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const e of monthEntries) {
      if (e.type === "expense") totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]);
  }, [monthEntries]);

  const categoryOptions = useMemo(() => {
    const names = new Set<string>([
      ...settings.categories.expense,
      ...settings.categories.income,
      ...monthEntries.map((e) => e.category),
    ]);
    return Array.from(names);
  }, [settings.categories, monthEntries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return monthEntries.filter((e) => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (q) {
        const text = `${e.category} ${e.note ?? ""} ${e.amount}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [monthEntries, query, typeFilter, categoryFilter]);

  const filtersActive = query.trim() !== "" || typeFilter !== "all" || categoryFilter !== "all";

  // Entries grouped by date (already sorted newest first)
  const groups = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const e of filtered) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  function goToMonth(delta: number) {
    setConfirmId(null);
    router.replace(`/?month=${shiftMonth(month, delta)}`);
  }

  function clearFilters() {
    setQuery("");
    setTypeFilter("all");
    setCategoryFilter("all");
  }

  async function handleDelete(entry: Expense) {
    setConfirmId(null);
    setError("");
    try {
      await deleteExpense(entry.id);
      setEntries((prev) => prev.filter((e) => e.id !== entry.id));
      show("Entry deleted", { action: { label: "Undo", onClick: () => undoDelete(entry) } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete this entry.");
    }
  }

  async function undoDelete(entry: Expense) {
    try {
      await restoreExpense(entry);
      await load(true);
      show("Entry restored");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not restore this entry.", { tone: "error" });
    }
  }

  const overBudget = budget !== null && expenseTotal > budget;
  const budgetPct = budget ? Math.min((expenseTotal / budget) * 100, 100) : 0;

  return (
    <div className="space-y-6">
      {(pull > 0 || refreshing) && (
        <div
          className="fixed left-1/2 top-2 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-surface text-accent shadow-md"
          style={{ transform: `translate(-50%, ${refreshing ? 24 : pull * 0.6}px)` }}
        >
          <svg {...smallIcon} className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}>
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <path d="M21 4v5h-5" />
          </svg>
        </div>
      )}

      {/* Header + month switcher */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Overview</p>
          <h1 className="text-xl font-semibold tracking-tight">{formatMonth(month)}</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => goToMonth(-1)}
            aria-label="Previous month"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-sm transition active:scale-95"
          >
            <Chevron direction="left" />
          </button>
          <button
            onClick={() => goToMonth(1)}
            disabled={month >= thisMonth}
            aria-label="Next month"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-sm transition active:scale-95 disabled:opacity-35 disabled:active:scale-100"
          >
            <Chevron direction="right" />
          </button>
        </div>
      </header>

      {/* Summary card */}
      {loading ? (
        <Skeleton className="h-52" />
      ) : (
        <section className="rounded-3xl bg-linear-to-br from-indigo-600 to-indigo-500 p-6 text-white shadow-lg shadow-indigo-600/20">
          <p className="text-sm text-indigo-100">Spent this month</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{formatMoney(expenseTotal)}</p>
          {changePct !== null && changePct !== 0 && (
            <p className="mt-1 text-xs text-indigo-100">
              {Math.abs(changePct)}% {changePct > 0 ? "more" : "less"} than last month
            </p>
          )}

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

          {budget ? (
            <div className="mt-5">
              <div className="flex justify-between text-xs text-indigo-100">
                <span>Budget</span>
                <span>
                  {formatMoney(expenseTotal)} of {formatMoney(budget)}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full transition-all ${
                    overBudget ? "bg-rose-300" : "bg-white"
                  }`}
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-indigo-100">
                {overBudget
                  ? `${formatMoney(expenseTotal - budget)} over budget`
                  : `${formatMoney(budget - expenseTotal)} left`}
              </p>
            </div>
          ) : (
            <Link
              href="/settings"
              className="mt-5 inline-block text-xs text-indigo-100 underline underline-offset-2"
            >
              Set a monthly budget
            </Link>
          )}
        </section>
      )}

      {error && (
        <p className="rounded-2xl border border-err-line bg-err-bg px-4 py-3 text-sm text-err-ink">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-52" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <>
          {/* Last 6 months */}
          <section>
            <h2 className="mb-3 text-sm font-semibold">Last 6 months</h2>
            <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
              <TrendChart data={trend} />
            </div>
          </section>

          {/* Spending by category */}
          <section>
            <h2 className="mb-3 text-sm font-semibold">Spending by category</h2>
            <div className="space-y-4 rounded-3xl border border-line bg-surface p-5 shadow-sm">
              {categoryTotals.length === 0 ? (
                <p className="text-center text-sm text-muted">No spending recorded yet.</p>
              ) : (
                categoryTotals.map(([category, amount]) => {
                  const pct = expenseTotal > 0 ? (amount / expenseTotal) * 100 : 0;
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2.5 text-ink">
                          <CategoryIcon name={category} className="h-4 w-4 text-accent" />
                          {category}
                        </span>
                        <span className="font-medium tabular-nums">{formatMoney(amount)}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle">
                        <div
                          className="h-full rounded-full bg-accent transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Transactions */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold">Transactions</h2>

            {monthEntries.length > 0 && (
              <div className="space-y-3">
                <div className="relative">
                  <SearchIcon />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search notes, categories or amounts"
                    className="w-full rounded-2xl border border-line bg-surface py-3 pl-10 pr-4 text-base text-ink outline-none placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-1 gap-1 rounded-xl bg-subtle p-1">
                    {(["all", "expense", "income"] as const).map((value) => (
                      <button
                        key={value}
                        onClick={() => setTypeFilter(value)}
                        className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition ${
                          typeFilter === value ? "bg-surface text-ink shadow-sm" : "text-muted"
                        }`}
                      >
                        {value === "all" ? "All" : value}
                      </button>
                    ))}
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                    className="w-32 rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                  >
                    <option value="all">All categories</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {monthEntries.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-subtle text-accent">
                  <CategoryIcon name="Bills" className="h-7 w-7" />
                </span>
                <p className="mt-3 text-sm font-medium">No expenses yet</p>
                <p className="mt-1 text-sm text-muted">Nothing recorded for this month.</p>
                <Link
                  href="/add"
                  className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm active:scale-95"
                >
                  Add your first entry
                </Link>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-10 text-center">
                <p className="text-sm font-medium">No matching entries</p>
                <button
                  onClick={clearFilters}
                  className="mt-3 text-sm font-medium text-accent"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {filtersActive && (
                  <p className="px-1 text-xs text-muted">
                    {filtered.length} of {monthEntries.length} entries ·{" "}
                    <button onClick={clearFilters} className="font-medium text-accent">
                      Clear filters
                    </button>
                  </p>
                )}
                {groups.map(([date, items]) => (
                  <div key={date}>
                    <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-faint">
                      {formatDayLabel(date)}
                    </p>
                    <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
                      {items.map((e) => (
                        <EntryRow
                          key={e.id}
                          entry={e}
                          confirming={confirmId === e.id}
                          onAskDelete={() => setConfirmId(e.id)}
                          onCancel={() => setConfirmId(null)}
                          onDelete={() => handleDelete(e)}
                        />
                      ))}
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
