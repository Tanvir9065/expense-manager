"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  addExpense,
  parseAmount,
  todayString,
  type EntryType,
} from "@/lib/expenses";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-3 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income mili" },
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

  // Aaj ki date browser mein set hoti hai (server ke timezone se mismatch na ho)
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
      setError(err instanceof Error ? err.message : "Amount galat hai.");
      return;
    }

    if (!date) {
      setError("Date chuniye.");
      return;
    }

    setSaving(true);
    try {
      await addExpense({ type, amount: value, category, date, note });
      router.push(`/?month=${date.slice(0, 7)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Entry save nahi ho paayi.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-lg font-semibold">Nayi entry</h1>

      {/* Expense / Income toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => changeType(opt.value)}
            className={`rounded-md py-2 text-sm font-medium transition ${
              type === opt.value
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-zinc-500"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-600">Amount (₹)</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-600">Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={inputClass}
        >
          {CATEGORIES[type].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-600">Date</span>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm text-zinc-600">Note (optional)</span>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={type === "income" ? "Jaise: October salary" : "Jaise: lunch, auto, recharge"}
          className={inputClass}
        />
      </label>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-indigo-600 py-3 text-base font-semibold text-white active:bg-indigo-700 disabled:opacity-60"
      >
        {saving ? "Save ho raha hai…" : "Save karein"}
      </button>
    </form>
  );
}
