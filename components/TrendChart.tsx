import { formatCompact } from "@/lib/utils";

type Bar = { label: string; value: number; active: boolean };

// Simple bar chart: one bar per month.
export default function TrendChart({ data }: { data: Bar[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2">
      {data.map((d) => {
        const height = d.value > 0 ? Math.max((d.value / max) * 100, 4) : 0;
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="h-4 text-[10px] tabular-nums text-muted">
              {d.value > 0 ? formatCompact(d.value) : ""}
            </span>
            <div className="flex h-24 w-full items-end">
              <div
                className={`w-full rounded-t-lg ${d.active ? "bg-accent" : "bg-accent/25"}`}
                style={{ height: `${height}%` }}
              />
            </div>
            <span
              className={`text-[11px] ${d.active ? "font-semibold text-ink" : "text-muted"}`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
