"use client";

import { useRouter } from "next/navigation";
import EntryForm from "@/components/EntryForm";
import { useToast } from "@/components/Toast";
import { addExpense } from "@/lib/api";

export default function AddEntryPage() {
  const router = useRouter();
  const { show } = useToast();

  return (
    <EntryForm
      eyebrow="New"
      heading="Add entry"
      submitLabel={(type) => `Save ${type}`}
      onSubmit={async (input) => {
        await addExpense(input);
        show("Entry saved");
        router.push(`/?month=${input.date.slice(0, 7)}`);
      }}
    />
  );
}
