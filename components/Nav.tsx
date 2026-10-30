"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const icon = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-5 w-5",
};

function HomeIcon() {
  return (
    <svg {...icon}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg {...icon} strokeWidth={2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg {...icon}>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg {...icon}>
      <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
    </svg>
  );
}

const links = [
  { href: "/", label: "Dashboard", Icon: HomeIcon },
  { href: "/add", label: "Add", Icon: PlusIcon },
  { href: "/recurring", label: "Recurring", Icon: RepeatIcon },
  { href: "/settings", label: "Settings", Icon: SlidersIcon },
];

export default function Nav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]">
      <div className="mx-auto flex max-w-md gap-1 rounded-2xl border border-line bg-surface/90 p-1.5 shadow-lg shadow-slate-900/10 backdrop-blur">
        {links.map(({ href, label, Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname.startsWith("/edit")
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-medium transition ${
                active ? "bg-accent text-white shadow-sm" : "text-muted hover:bg-subtle"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
