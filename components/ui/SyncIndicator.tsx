"use client";
import type { SyncState } from "@/hooks/useTasks";

interface Props { state: SyncState; count: number; }

export function SyncIndicator({ state, count }: Props) {
  if (state === "synced") return null;  // absence = synced (no noise)

  const label = state === "queued"
    ? `${count} change${count !== 1 ? "s" : ""} queued — will sync when online`
    : "Syncing…";

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      title={label}
      className={`sync-indicator--${state}`}
      style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
      <span aria-hidden="true">
        {state === "queued" ? "◉" : "⟳"}
      </span>
      <span style={{ fontSize: 11 }}>
        {state === "queued" ? `${count} queued` : "syncing"}
      </span>
    </span>
  );
}
