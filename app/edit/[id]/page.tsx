"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import EntryForm from "@/components/EntryForm";
import { useToast } from "@/components/Toast";
import { fetchExpense, updateExpense } from "@/lib/api";
import type { Expense } from "@/lib/utils";

export default function EditEntryPage() {
  const router = useRouter();
  const { show } = useToast();
  const { id } = useParams<{ id: string }>();

  const [entry, setEntry] = useState<Expense | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExpense(id)
      .then(setEntry)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load this entry."));
  }, [id]);

  if (error) {
    return (
      <div className="space-y-4">
        <p className="rounded-2xl border border-err-line bg-err-bg px-4 py-3 text-sm text-err-ink">
          {error}
        </p>
        <Link href="/" className="text-sm font-medium text-accent">
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 animate-pulse rounded-2xl bg-subtle" />
        <div className="h-12 animate-pulse rounded-2xl bg-subtle" />
        <div className="h-32 animate-pulse rounded-3xl bg-subtle" />
        <div className="h-24 animate-pulse rounded-2xl bg-subtle" />
      </div>
    );
  }

  return (
    <EntryForm
      initial={entry}
      eyebrow="Edit"
      heading="Edit entry"
      submitLabel={() => "Save changes"}
      onSubmit={async (input) => {
        await updateExpense(entry.id, input);
        show("Entry updated");
        router.push(`/?month=${input.date.slice(0, 7)}`);
      }}
    />
  );
}
