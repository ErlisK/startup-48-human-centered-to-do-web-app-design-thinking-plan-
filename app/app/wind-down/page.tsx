"use client";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/lib/supabase/types";

export default function WindDownPage() {
  const router = useRouter();
  const { tasks: openTasks, doneTasks, rescheduleTask } = useTasks("today") as any;
  const { tasks: done } = useTasks("done-today");
  const [undoMsg, setUndoMsg] = useState<string | null>(null);
  const [lastReschedule, setLastReschedule] = useState<{ id: string; prev: string | null } | null>(null);
  const [jiggled, setJiggled] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // CW-007: Card jiggle hint on first load per session
  useEffect(() => {
    const key = "focus_winddown_jiggle_" + new Date().toDateString();
    if (!sessionStorage.getItem(key)) {
      setTimeout(() => {
        setJiggled(true);
        setTimeout(() => setJiggled(false), 500);
      }, 600);
      sessionStorage.setItem(key, "1");
    }
  }, []);

  const remaining = (openTasks ?? []).filter((t: Task) => !t.completed_at);

  async function reschedule(task: Task, toTomorrow: boolean) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    const newDate = toTomorrow ? tomorrow.toISOString() : task.due_at;
    setLastReschedule({ id: task.id, prev: task.due_at });
    await (rescheduleTask ?? (() => {}))(task.id, newDate);
    setUndoMsg(toTomorrow ? "Moved to tomorrow" : "Kept for today");
    setTimeout(() => { setUndoMsg(null); setLastReschedule(null); }, 5000);
  }

  async function undoReschedule() {
    if (!lastReschedule) return;
    await (rescheduleTask ?? (() => {}))(lastReschedule.id, lastReschedule.prev);
    setUndoMsg(null); setLastReschedule(null);
  }

  if (remaining.length === 0) return (
    <div style={{ padding: 32, textAlign: "center", maxWidth: 400, margin: "0 auto" }}>
      <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
        You completed {done.length} task{done.length !== 1 ? "s" : ""} today.
      </p>
      <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>All done today. Nothing to reschedule.</p>
      <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: 16 }}>See you tomorrow.</p>
      <button onClick={() => router.push("/app/today")}
        style={{ padding: "12px 24px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 }}>
        Close for the day ✓
      </button>
    </div>
  );

  const task = remaining[0];

  return (
    <div style={{ padding: "32px 20px", maxWidth: 440, margin: "0 auto" }}>
      {/* A03: completion leads */}
      <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
        You completed {done.length} task{done.length !== 1 ? "s" : ""} today.
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
        {remaining.length} task{remaining.length !== 1 ? "s" : ""} still open:
      </p>

      {/* Swipe card (CW-007: jiggle hint) */}
      <div ref={cardRef}
        className={jiggled ? "wind-down-card--hint" : ""}
        style={{ background: "var(--bg-elevated)", borderRadius: 10, padding: 20, marginBottom: 16, border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>{task.title}</div>
        {task.tags.map((t: string) => <span key={t} className="tag-chip" style={{ marginRight: 4 }}>#{t}</span>)}
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => reschedule(task, true)}
            style={{ flex: 1, padding: "10px", background: "#1a0d0d", border: "1px solid var(--accent-red)", borderRadius: "var(--radius)", color: "var(--accent-red)", cursor: "pointer", fontSize: 13 }}>
            ← Tomorrow
          </button>
          <button onClick={() => reschedule(task, false)}
            style={{ flex: 1, padding: "10px", background: "#0d2a0d", border: "1px solid var(--accent-green)", borderRadius: "var(--radius)", color: "var(--accent-green)", cursor: "pointer", fontSize: 13 }}>
            Keep Today →
          </button>
        </div>
      </div>

      {/* HV-005: Inline undo */}
      {undoMsg && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", background: "var(--bg-surface)", borderRadius: "var(--radius)", fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
          <span>{undoMsg}</span>
          <button onClick={undoReschedule} style={{ color: "var(--accent-blue)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Undo</button>
        </div>
      )}

      {remaining.length <= 1 && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-green)", marginBottom: 8 }}>Ready for tomorrow.</p>
          <p style={{ color: "var(--text-secondary)", marginBottom: 4 }}>{done.length} done today.</p>
          {/* A03: explicit normalisation */}
          <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
            {remaining.length === 1 ? "One moved — no problem." : `${remaining.length} moved — no problem.`}
          </p>
          <button onClick={() => router.push("/app/today")}
            style={{ padding: "12px 28px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 }}>
            Close for the day ✓
          </button>
        </div>
      )}
    </div>
  );
}
