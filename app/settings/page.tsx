"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { logout, saveSettings } from "@/lib/api";
import { useSettings } from "@/lib/useSettings";
import { categoryIcon, formatMoney, type Categories, type EntryType } from "@/lib/utils";

const fieldClass =
  "w-full rounded-2xl border border-line bg-surface px-4 py-3 text-base text-ink outline-none transition placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/15";

const cardClass = "rounded-3xl border border-line bg-surface p-5 shadow-sm";

type CategoryEditorProps = {
  title: string;
  type: EntryType;
  categories: Categories;
  onChange: (type: EntryType, next: string[]) => Promise<void>;
};

function CategoryEditor({ title, type, categories, onChange }: CategoryEditorProps) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const list = categories[type];

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const next = name.trim();
    if (!next) return;
    if (list.some((c) => c.toLowerCase() === next.toLowerCase())) {
      show("That category already exists.", { tone: "error" });
      return;
    }
    setBusy(true);
    await onChange(type, [...list, next]);
    setName("");
    setBusy(false);
  }

  async function remove(category: string) {
    if (list.length <= 1) {
      show("Keep at least one category.", { tone: "error" });
      return;
    }
    setBusy(true);
    await onChange(
      type,
      list.filter((c) => c !== category)
    );
    setBusy(false);
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="flex flex-wrap gap-2">
        {list.map((c) => (
          <span
            key={c}
            className="flex items-center gap-1.5 rounded-full border border-line bg-subtle py-1.5 pl-3 pr-1.5 text-sm"
          >
            <span>{categoryIcon(c)}</span>
            {c}
            <button
              onClick={() => remove(c)}
              disabled={busy}
              aria-label={`Remove ${c}`}
              className="flex h-6 w-6 items-center justify-center rounded-full text-faint hover:bg-surface hover:text-red-600 disabled:opacity-50"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <form onSubmit={add} className="mt-3 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          placeholder="New category"
          aria-label={`New ${type} category`}
          className={fieldClass}
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="shrink-0 rounded-2xl bg-accent px-5 text-sm font-medium text-white disabled:opacity-50"
        >
          Add
        </button>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { show } = useToast();
  const { settings, setSettings, loaded, error } = useSettings();

  const [budgetInput, setBudgetInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);

  useEffect(() => {
    if (loaded) setBudgetInput(settings.budget ? String(settings.budget) : "");
  }, [loaded, settings.budget]);

  async function saveBudget(value: number | null) {
    setSavingBudget(true);
    try {
      setSettings(await saveSettings({ budget: value }));
      show(value === null ? "Budget removed" : "Budget saved");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not save the budget.", { tone: "error" });
    } finally {
      setSavingBudget(false);
    }
  }

  function handleBudgetSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(budgetInput);
    if (!budgetInput.trim() || !Number.isFinite(value) || value <= 0) {
      show("Enter a budget greater than 0.", { tone: "error" });
      return;
    }
    saveBudget(Math.round(value * 100) / 100);
  }

  async function changeCategories(type: EntryType, next: string[]) {
    try {
      const saved = await saveSettings({ categories: { ...settings.categories, [type]: next } });
      setSettings(saved);
      show("Categories updated");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update categories.", { tone: "error" });
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-faint">Preferences</p>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
      </header>

      {error && (
        <p className="rounded-2xl border border-err-line bg-err-bg px-4 py-3 text-sm text-err-ink">
          {error}
        </p>
      )}

      {/* Budget */}
      <section className={cardClass}>
        <h2 className="text-sm font-semibold">Monthly budget</h2>
        <p className="mt-1 text-sm text-muted">
          {settings.budget
            ? `Currently ${formatMoney(settings.budget)} per month.`
            : "Set a limit and the dashboard will track it."}
        </p>
        <form onSubmit={handleBudgetSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint">
              ₹
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="20000"
              aria-label="Monthly budget"
              className={`${fieldClass} pl-9`}
            />
          </div>
          <button
            type="submit"
            disabled={savingBudget || !loaded}
            className="shrink-0 rounded-2xl bg-accent px-5 text-sm font-medium text-white disabled:opacity-50"
          >
            Save
          </button>
        </form>
        {settings.budget && (
          <button
            onClick={() => saveBudget(null)}
            disabled={savingBudget}
            className="mt-3 text-sm font-medium text-muted underline underline-offset-2"
          >
            Remove budget
          </button>
        )}
      </section>

      {/* Categories */}
      <section className={`${cardClass} space-y-6`}>
        <div>
          <h2 className="text-sm font-semibold">Categories</h2>
          <p className="mt-1 text-sm text-muted">
            Removing a category does not change entries you already saved.
          </p>
        </div>
        <CategoryEditor
          title="Expense"
          type="expense"
          categories={settings.categories}
          onChange={changeCategories}
        />
        <CategoryEditor
          title="Income"
          type="income"
          categories={settings.categories}
          onChange={changeCategories}
        />
      </section>

      {/* Export */}
      <section className={cardClass}>
        <h2 className="text-sm font-semibold">Export</h2>
        <p className="mt-1 text-sm text-muted">
          Download every entry as a CSV file for Excel or Google Sheets.
        </p>
        <a
          href="/api/export"
          download
          className="mt-4 inline-block rounded-2xl border border-line px-5 py-2.5 text-sm font-medium active:bg-subtle"
        >
          Download CSV
        </a>
      </section>

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full rounded-2xl border border-line bg-surface py-3.5 text-sm font-medium text-muted active:bg-subtle"
      >
        Sign out
      </button>
    </div>
  );
}
