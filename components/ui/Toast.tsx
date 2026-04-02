"use client";
import { createContext, useCallback, useContext, useState, useRef, useId } from "react";

interface ToastItem {
  id: string;
  message: string;
  duration: number;   // 0 = sticky
  variant: "green" | "amber" | "red";
}

interface ToastContextValue {
  showToast: (opts: { message: string; duration?: number; variant?: "green" | "amber" | "red" }) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() { return useContext(ToastContext); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback(({ message, duration = 3000, variant = "green" }: { message: string; duration?: number; variant?: ToastItem["variant"] }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, message, duration, variant }]); // max 3
    if (duration > 0) {
      const t = setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
      timers.current.set(id, t);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const variantStyle = (v: ToastItem["variant"]) => ({
    green: { background: "#0d2a0d", border: "1px solid var(--accent-green)", color: "var(--accent-green)" },
    amber: { background: "#2a1d0d", border: "1px solid var(--accent-amber)", color: "var(--accent-amber)" },
    red:   { background: "#2a0d0d", border: "1px solid var(--accent-red)",   color: "var(--accent-red)"   },
  }[v]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* aria-live="polite" announces toasts to screen readers without interrupting */}
      <div
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-relevant="additions"
        className="toast-stack"
        style={{ position: "fixed", bottom: 72, right: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 6, pointerEvents: "none", maxWidth: 360 }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="toast-item"
            style={{ ...variantStyle(t.variant), borderRadius: "var(--radius)", padding: "8px 14px", fontSize: 13, pointerEvents: "auto", display: "flex", alignItems: "center", gap: 8, animation: "toast-in 150ms ease-out" }}>
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label={`Dismiss: ${t.message}`}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: 16, lineHeight: 1, padding: "0 2px", opacity: 0.7 }}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
