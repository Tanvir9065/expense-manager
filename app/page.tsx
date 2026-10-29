import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export default function HomePage() {
  return (
    <Suspense
      fallback={<p className="py-10 text-center text-sm text-slate-500">Loading…</p>}
    >
      <Dashboard />
    </Suspense>
  );
}
