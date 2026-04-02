"use client";
import type { SyncState } from "@/hooks/useTasks";
export function SyncIndicator({ state, count }: { state: SyncState; count: number }) {
  if (state === "synced") return <span style={{ width: 24, display: "inline-block" }} aria-hidden />;
  return (
    <span
      className={`sync-indicator--${state}`}
      title={state === "queued" ? `Offline — ${count} tasks queued` : "Syncing…"}
      aria-label={state === "queued" ? `Offline, ${count} tasks queued` : "Syncing"}
      style={{ width: 24, textAlign: "center", fontSize: 14, cursor: "default" }}
    >◉</span>
  );
}
