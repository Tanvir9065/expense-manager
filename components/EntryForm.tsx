"use client";

import { useEffect, useState } from "react";
import CategoryIcon from "@/components/CategoryIcon";
import { fetchCategoryUsage } from "@/lib/api";
import { useSettings } from "@/lib/useSettings";
import {
  parseAmount,
  todayString,
  type CategoryUsage,
  type EntryInput,
  type EntryType,
  type Expense,
} from "@/lib/utils";

const TOP_CATEGORIES = 10; // how many category chips are shown before "More"

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
  const [usage, setUsage] = useState<CategoryUsage | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Today's date is set in the browser so it matches the user's timezone
  useEffect(() => {
    if (!initial) setDate(todayString());
  }, [initial]);

  // How often each category has been used (if this fails, the settings order is used)
  useEffect(() => {
    fetchCategoryUsage()
      .then(setUsage)
      .catch(() => setUsage({ expense: {}, income: {} }));
  }, []);

  // Category list for the chosen type. When editing, keep the entry's own
  // category selectable even if it was later removed from Settings.
  const base = settings.categories[type];
  const list =
    initial && initial.type === type && !base.includes(initial.category)
      ? [...base, initial.category]
      : base;

  // Most used first; categories with the same count keep their Settings order
  const counts = usage?.[type] ?? {};
  const ranked = [...list].sort(
    (a, b) => (counts[b] ?? 0) - (counts[a] ?? 0) || list.indexOf(a) - list.indexOf(b)
  );
  const selected = list.includes(category) ? category : ranked[0];

  // Show the 10 most used, plus the selected one if it is not among them
  const top = ranked.slice(0, TOP_CATEGORIES);
  if (!top.includes(selected)) top.push(selected);
  const hiddenCount = ranked.length - top.length;
  const visible = showAll ? ranked : top;

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
        <span className={labelClass}>
          Category{" "}
          {ranked.length > TOP_CATEGORIES && (
            <span className="font-normal text-faint">(most used first)</span>
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          {loaded && usage
            ? visible.map((c) => (
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
                  <CategoryIcon name={c} className="h-4 w-4" />
                  {c}
                </button>
              ))
            : [0, 1, 2, 3].map((i) => (
                <div key={i} className="h-11 w-24 animate-pulse rounded-full bg-subtle" />
              ))}

          {loaded && usage && (hiddenCount > 0 || showAll) && ranked.length > TOP_CATEGORIES && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="rounded-full border border-dashed border-line px-4 py-2.5 text-sm font-medium text-accent transition active:scale-95"
            >
              {showAll ? "Show less" : `More (${hiddenCount})`}
            </button>
          )}
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
        disabled={saving || !loaded || !usage}
        className="w-full rounded-2xl bg-accent py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition active:scale-[0.99] disabled:opacity-60"
      >
        {saving ? "Saving…" : submitLabel(type)}
      </button>
    </form>
  );
}
