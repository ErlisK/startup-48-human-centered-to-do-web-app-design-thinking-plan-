"use client";
import { useEffect } from "react";
import { flushQueue, getPendingCount } from "@/lib/offline/queue";
import { setSyncState } from "./useSyncState";

type FlushHandler = Parameters<typeof flushQueue>[0];
const SYNC_TAG = "focus-task-sync";

export function useBackgroundSync(onFlush: FlushHandler) {
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    async function registerSync() {
      const count = await getPendingCount();
      if (count === 0) return;
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        try {
          const reg = await navigator.serviceWorker.ready;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (reg as any).sync.register(SYNC_TAG);
        } catch { /* Background Sync not supported — online event is fallback */ }
      }
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === "BACKGROUND_SYNC") {
        setSyncState("syncing");
        await flushQueue(onFlush);
        const pending = await getPendingCount();
        setSyncState(pending > 0 ? "queued" : "synced", pending);
      }
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }
    registerSync();

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, [onFlush]);
}
