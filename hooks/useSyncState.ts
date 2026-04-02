"use client";
import { useState, useEffect } from "react";
import { getPendingCount } from "@/lib/offline/queue";
import type { SyncState } from "./useTasks";

let globalState: SyncState = "synced";
let globalCount = 0;
const listeners = new Set<() => void>();
export function setSyncState(s: SyncState, c = 0) { globalState = s; globalCount = c; listeners.forEach((fn) => fn()); }

export function useSyncState() {
  const [state, setState] = useState<SyncState>(globalState);
  const [count, setCount] = useState(globalCount);
  useEffect(() => {
    const update = () => { setState(globalState); setCount(globalCount); };
    listeners.add(update);
    getPendingCount().then((n) => { if (n > 0) setSyncState("queued", n); });
    return () => { listeners.delete(update); };
  }, []);
  return { state, count };
}
