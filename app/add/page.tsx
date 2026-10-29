"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  addExpense,
  parseAmount,
  todayString,
  type EntryType,
} from "@/lib/expenses";

const fieldClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

const labelClass = "mb-2 block text-sm font-medium text-slate-700";

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

export default function AddEntryPage() {
  const router = useRouter();

  const [type, setType] = useState<EntryType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES.expense[0]);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Today's date is set in the browser so it matches the user's timezone
  useEffect(() => {
    setDate(todayString());
  }, []);

  function changeType(next: EntryType) {
    setType(next);
    setCategory(CATEGORIES[next][0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    let value: number;
    try {
      value = parseAmount(amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid amount.");
      return;
    }

    if (!date) {
      setError("Please choose a date.");
      return;
    }

    setSaving(true);
    try {
      await addExpense({ type, amount: value, category, date, note });
      router.push(`/?month=${date.slice(0, 7)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this entry.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">New</p>
        <h1 className="text-xl font-semibold tracking-tight">Add entry</h1>
      </header>

      {/* Expense / Income toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/60 p-1">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => changeType(opt.value)}
            className={`rounded-xl py-2.5 text-sm font-medium transition ${
              type === opt.value
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="rounded-3xl border border-slate-200/70 bg-white p-6 text-center shadow-sm">
        <label htmlFor="amount" className="text-sm text-slate-500">
          Amount
        </label>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-3xl font-semibold text-slate-300">₹</span>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-32 bg-transparent text-center text-4xl font-semibold tracking-tight outline-none placeholder:text-slate-200"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <span className={labelClass}>Category</span>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES[type].map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <span>{CATEGORY_ICONS[c]}</span>
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className={labelClass}>
          Date
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className={labelClass}>
          Note <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === "income" ? "e.g. October salary" : "e.g. Lunch with friends"}
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition active:scale-[0.99] active:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : `Save ${type}`}
      </button>
    </form>
  );
}
