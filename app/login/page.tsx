"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setBusy(true);
    setError("");
    try {
      await login(pin);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col justify-center">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-white shadow-lg shadow-accent/30">
            <svg
              viewBox="0 0 512 512"
              fill="none"
              stroke="currentColor"
              strokeWidth={38}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="h-9 w-9"
            >
              <path d="M168 148h188M168 214h188" />
              <path d="M168 148h62a71 71 0 0 1 0 142h-62l152 106" />
            </svg>
          </div>
          <h1 className="mt-5 text-xl font-semibold tracking-tight">Expense Tracker</h1>
          <p className="mt-1 text-sm text-muted">Enter your PIN to continue</p>
        </div>

        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="PIN"
          aria-label="PIN"
          className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-center text-xl tracking-[0.4em] text-ink outline-none placeholder:tracking-normal placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/15"
        />

        {error && (
          <p className="rounded-2xl border border-err-line bg-err-bg px-4 py-3 text-center text-sm text-err-ink">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !pin}
          className="w-full rounded-2xl bg-accent py-4 text-base font-semibold text-white shadow-lg shadow-accent/20 transition active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? "Checking…" : "Unlock"}
        </button>
      </form>
    </div>
  );
}
