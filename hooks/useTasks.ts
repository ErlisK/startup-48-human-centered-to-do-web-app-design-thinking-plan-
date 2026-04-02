"use client";
import { useEffect, useState, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ulid } from "@/lib/offline/ulid";
import { enqueue, flushQueue, getPendingCount } from "@/lib/offline/queue";
import type { Task } from "@/lib/supabase/types";

export type SyncState = "synced" | "queued" | "syncing";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => getSupabaseClient() as any;

export function useTasks(view: "today" | "inbox" | "done-today" = "inbox") {
  const [tasks, setTasks]           = useState<Task[]>([]);
  const [loading, setLoading]       = useState(true);
  const [syncState, setSyncState]   = useState<SyncState>("synced");
  const [queueCount, setQueueCount] = useState(0);

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await db().auth.getUser();
    if (!user) { setLoading(false); return; }

    let data: Task[] | null = null;
    if (view === "today") {
      const r = await db().rpc("today_tasks", { p_user_id: user.id });
      data = r.data;
    } else if (view === "done-today") {
      const r = await db().rpc("done_today", { p_user_id: user.id });
      data = r.data;
    } else {
      const r = await db().from("tasks").select("*")
        .is("deleted_at", null).is("completed_at", null)
        .order("created_at", { ascending: false });
      data = r.data;
    }
    if (data) setTasks(data);
    setLoading(false);
  }, [view]);

  useEffect(() => {
    fetchTasks();
    const supabase = db();
    const channel = supabase.channel("tasks-rt-" + view)
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks, view]);

  useEffect(() => {
    const handleOnline = async () => {
      const count = await getPendingCount();
      if (count === 0) return;
      setSyncState("syncing");
      const { data: { user } } = await db().auth.getUser();
      if (!user) return;
      await flushQueue(async (write) => {
        if (write.operation === "insert") await db().from("tasks").upsert(write.payload);
        else if (write.operation === "update") await db().from("tasks").update(write.payload).eq("id", write.payload.id);
        else await db().from("tasks").update({ deleted_at: new Date().toISOString() }).eq("id", write.payload.id);
      });
      setSyncState("synced"); setQueueCount(0); fetchTasks();
    };
    const handleOffline = () => setSyncState("queued");
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline); };
  }, [fetchTasks]);

  const addTask = useCallback(async (partial: Omit<Task, "id" | "user_id" | "created_at" | "completed_at" | "deleted_at"> & { id?: string }) => {
    const { data: { user } } = await db().auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const task: Task = {
      id: partial.id ?? ulid(), user_id: user.id, title: partial.title,
      tags: partial.tags ?? [], priority: partial.priority ?? null, due_at: partial.due_at ?? null,
      completed_at: null, deleted_at: null, time_estimate_minutes: partial.time_estimate_minutes ?? null,
      created_at: new Date().toISOString(),
    };
    setTasks((prev) => [task, ...prev]);
    if (!navigator.onLine) {
      await enqueue({ id: task.id, operation: "insert", payload: task });
      setSyncState("queued"); setQueueCount((n) => n + 1);
      return task;
    }
    const { error } = await db().from("tasks").insert(task);
    if (error) { setTasks((prev) => prev.filter((t) => t.id !== task.id)); throw error; }
    return task;
  }, []);

  const completeTask = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (!navigator.onLine) { await enqueue({ id, operation: "update", payload: { id, completed_at: now } }); setSyncState("queued"); return; }
    await db().from("tasks").update({ completed_at: now }).eq("id", id);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (!navigator.onLine) { await enqueue({ id, operation: "delete", payload: { id } }); setSyncState("queued"); return; }
    await db().from("tasks").update({ deleted_at: now }).eq("id", id);
  }, []);

  const rescheduleTask = useCallback(async (id: string, due_at: string | null) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, due_at } : t));
    await db().from("tasks").update({ due_at }).eq("id", id);
  }, []);

  return { tasks, loading, syncState, queueCount, addTask, completeTask, deleteTask, rescheduleTask, refetch: fetchTasks };
}
