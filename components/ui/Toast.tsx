"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface ToastItem { id: string; message: string; duration: number; variant?: "green" | "amber"; }
interface ToastCtx { showToast: (opts: Omit<ToastItem, "id">) => void; }

const ToastContext = createContext<ToastCtx>({ showToast: () => {} });
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const showToast = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, ...opts }]); // max 3
    if (opts.duration > 0) setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), opts.duration);
  }, []);
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast-item" onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            style={{ borderColor: t.variant === "amber" ? "var(--accent-amber)" : "var(--accent-green)", color: t.variant === "amber" ? "var(--accent-amber)" : "var(--accent-green)" }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
