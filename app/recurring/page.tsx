"use client";

import { useCallback, useEffect, useState } from "react";
import EntryForm from "@/components/EntryForm";
import { useToast } from "@/components/Toast";
import {
  addRecurring,
  deleteRecurring,
  fetchRecurring,
  runRecurring,
  updateRecurring,
} from "@/lib/api";
import { categoryIcon, formatMoney, todayString, type Recurring } from "@/lib/utils";

function ordinal(n: number): string {
  if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  return `${n}${suffixes[n % 10] ?? "th"}`;
}

export default function RecurringPage() {
  const { show } = useToast();

  const [rules, setRules] = useState<Recurring[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      setRules(await fetchRecurring());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load recurring entries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(rule: Recurring) {
    try {
      // Resuming starts from today, so the paused period is not back-filled
      await updateRecurring(
        rule.id,
        rule.active ? { active: false } : { active: true, last_run: todayString() }
      );
      await load();
      show(rule.active ? "Paused" : "Resumed");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update.", { tone: "error" });
    }
  }

  async function remove(rule: Recurring) {
    setConfirmId(null);
    try {
      await deleteRecurring(rule.id);
      setRules((prev) => prev.filter((r) => r.id !== rule.id));
      show("Recurring entry deleted. Past entries were kept.");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not delete.", { tone: "error" });
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-faint">Automatic</p>
          <h1 className="text-xl font-semibold tracking-tight">Recurring</h1>
        </div>
        <button
          onClick={() => setAdding((v) => !v)}
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm active:scale-95"
        >
          {adding ? "Close" : "New"}
        </button>
      </header>

      <p className="text-sm text-muted">
        Rent, subscriptions, salary: added to your list automatically on the same day every month.
      </p>

      {adding && (
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
          <EntryForm
            dateLabel="First date"
            dateHint={(date) =>
              date ? `Repeats on the ${ordinal(Number(date.slice(8, 10)))} of every month` : null
            }
            submitLabel={() => "Add recurring entry"}
            onSubmit={async (input) => {
              await addRecurring({
                type: input.type,
                amount: input.amount,
                category: input.category,
                note: input.note,
                day_of_month: Number(input.date.slice(8, 10)),
                start_date: input.date,
              });
              await runRecurring(todayString());
              setAdding(false);
              show("Recurring entry added");
              await load();
            }}
          />
        </div>
      )}

      {error && (
        <p className="rounded-2xl border border-err-line bg-err-bg px-4 py-3 text-sm text-err-ink">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <div className="h-20 animate-pulse rounded-3xl bg-subtle" />
          <div className="h-20 animate-pulse rounded-3xl bg-subtle" />
        </div>
      ) : rules.length === 0 && !adding ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
          <span className="text-4xl">🔁</span>
          <p className="mt-3 text-sm font-medium">No recurring entries yet</p>
          <p className="mt-1 text-sm text-muted">Tap New to set one up.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
          {rules.map((rule) => {
            const isIncome = rule.type === "income";
            return (
              <li key={rule.id} className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-subtle text-lg">
                    {categoryIcon(rule.category)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium">
                      {rule.category}
                      {!rule.active && (
                        <span className="rounded-full bg-subtle px-2 py-0.5 text-[10px] font-medium text-muted">
                          Paused
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {ordinal(rule.day_of_month)} of every month
                      {rule.note ? ` · ${rule.note}` : ""}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold tabular-nums ${
                      isIncome ? "text-income" : "text-ink"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatMoney(rule.amount)}
                  </p>
                </div>

                <div className="mt-3 flex justify-end gap-2">
                  {confirmId === rule.id ? (
                    <>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted active:bg-subtle"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => remove(rule)}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white active:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleActive(rule)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted active:bg-subtle"
                      >
                        {rule.active ? "Pause" : "Resume"}
                      </button>
                      <button
                        onClick={() => setConfirmId(rule.id)}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted hover:text-red-600 active:bg-subtle"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
