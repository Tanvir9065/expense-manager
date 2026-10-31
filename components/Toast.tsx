"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type ToastOptions = {
  action?: { label: string; onClick: () => void };
  tone?: "default" | "error";
  duration?: number;
};

type ToastItem = ToastOptions & { id: number; message: string };

const ToastContext = createContext<{
  show: (message: string, options?: ToastOptions) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [online, setOnline] = useState(true);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId++;
      setToasts((prev) => [...prev.slice(-2), { id, message, ...options }]);
      const duration = options.duration ?? (options.action ? 6000 : 2600);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  // Offline banner
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {!online && (
        <div className="sticky top-0 z-40 bg-amber-500 px-4 py-1.5 text-center text-xs font-medium text-white">
          You&apos;re offline. Showing saved data; changes can&apos;t be saved.
        </div>
      )}

      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-30 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-2xl px-4 py-3 text-sm shadow-lg ${
              t.tone === "error" ? "bg-red-600 text-white" : "bg-ink text-page"
            }`}
          >
            <span>{t.message}</span>
            {t.action && (
              <button
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-lg px-2 py-1 font-semibold underline underline-offset-2"
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
