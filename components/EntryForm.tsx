"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/lib/useSettings";
import {
  categoryIcon,
  parseAmount,
  todayString,
  type EntryInput,
  type EntryType,
  type Expense,
} from "@/lib/utils";

type Props = {
  initial?: Pick<Expense, "type" | "amount" | "category" | "date" | "note">;
  eyebrow?: string;
  heading?: string;
  dateLabel?: string;
  dateHint?: (date: string) => string | null;
  submitLabel: (type: EntryType) => string;
  onSubmit: (input: EntryInput) => Promise<void>;
};

const fieldClass =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-base text-ink outline-none transition placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/15";

const labelClass = "mb-2 block text-sm font-medium text-ink";

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

export default function EntryForm({
  initial,
  eyebrow,
  heading,
  dateLabel = "Date",
  dateHint,
  submitLabel,
  onSubmit,
}: Props) {
  const { settings, loaded } = useSettings();

  const [type, setType] = useState<EntryType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [date, setDate] = useState(initial?.date ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Today's date is set in the browser so it matches the user's timezone
  useEffect(() => {
    if (!initial) setDate(todayString());
  }, [initial]);

  // Category list for the chosen type. When editing, keep the entry's own
  // category selectable even if it was later removed from Settings.
  const base = settings.categories[type];
  const list =
    initial && initial.type === type && !base.includes(initial.category)
      ? [...base, initial.category]
      : base;
  const selected = list.includes(category) ? category : list[0];

  function changeType(next: EntryType) {
    setType(next);
    setCategory("");
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
      await onSubmit({ type, amount: value, category: selected, date, note });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this entry.");
      setSaving(false);
    }
  }

  const hint = dateHint ? dateHint(date) : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {heading && (
        <header>
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wider text-faint">{eyebrow}</p>
          )}
          <h1 className="text-xl font-semibold tracking-tight">{heading}</h1>
        </header>
      )}

      {/* Expense / Income toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-subtle p-1">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => changeType(opt.value)}
            className={`rounded-xl py-2.5 text-sm font-medium transition ${
              type === opt.value ? "bg-surface text-ink shadow-sm" : "text-muted"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="rounded-3xl border border-line bg-surface p-6 text-center shadow-sm">
        <label htmlFor="amount" className="text-sm text-muted">
          Amount
        </label>
        <div className="mt-2 flex items-center justify-center gap-1">
          <span className="text-3xl font-semibold text-faint">₹</span>
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
            style={{ width: `${Math.max(amount.length, 1) + 0.5}ch` }}
            className="min-w-[1.5ch] bg-transparent text-center text-4xl font-semibold tracking-tight text-ink outline-none placeholder:text-faint/50"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <span className={labelClass}>Category</span>
        <div className="flex flex-wrap gap-2">
          {loaded
            ? list.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition active:scale-95 ${
                    selected === c
                      ? "border-accent bg-accent text-white shadow-sm"
                      : "border-line bg-surface text-muted"
                  }`}
                >
                  <span>{categoryIcon(c)}</span>
                  {c}
                </button>
              ))
            : [0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 w-24 animate-pulse rounded-full bg-subtle" />
              ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className={labelClass}>
          {dateLabel}
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />
        {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
      </div>

      {/* Note */}
      <div>
        <label htmlFor="note" className={labelClass}>
          Note <span className="font-normal text-faint">(optional)</span>
        </label>
        <input
          id="note"
          type="text"
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === "income" ? "e.g. October salary" : "e.g. Lunch with friends"}
          className={fieldClass}
        />
      </div>

      {error && (
        <p className="rounded-2xl border border-err-line bg-err-bg px-4 py-3 text-sm text-err-ink">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || !loaded}
        className="w-full rounded-2xl bg-accent py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition active:scale-[0.99] disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel(type)}
      </button>
    </form>
  );
}
