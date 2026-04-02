import { openDB, type IDBPDatabase } from "idb";
import type { Task } from "@/lib/supabase/types";

interface QueuedWrite {
  id: string;
  operation: "insert" | "update" | "delete";
  payload: Partial<Task> & { id: string };
  timestamp: number;
  attempts: number;
}

let db: IDBPDatabase | null = null;

async function getDB() {
  if (!db) {
    db = await openDB("focus-offline-queue", 1, {
      upgrade(database) {
        database.createObjectStore("writes", { keyPath: "id" });
      },
    });
  }
  return db;
}

export async function enqueue(write: Omit<QueuedWrite, "timestamp" | "attempts">) {
  const store = await getDB();
  await store.put("writes", { ...write, timestamp: Date.now(), attempts: 0 });
}

export async function flushQueue(
  onFlush: (write: QueuedWrite) => Promise<void>
) {
  const store = await getDB();
  const all = (await store.getAll("writes")) as QueuedWrite[];
  for (const write of all.sort((a, b) => a.timestamp - b.timestamp)) {
    try {
      await onFlush(write);
      await store.delete("writes", write.id);
    } catch {
      write.attempts += 1;
      if (write.attempts >= 5) await store.delete("writes", write.id);
      else await store.put("writes", write);
    }
  }
}

export async function getPendingCount() {
  const store = await getDB();
  return store.count("writes");
}
