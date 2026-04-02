"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { DoneWall } from "@/components/done-wall/DoneWall";
import { TaskRow } from "@/components/tasks/TaskRow";
import { CaptureBar } from "@/components/capture/CaptureBar";
import type { Task } from "@/lib/supabase/types";

const FOCUS_LIMIT = 3;

export default function TodayPage() {
  const wallRef  = useRef<HTMLElement>(null);
  const listRef  = useRef<HTMLUListElement>(null);
  const { tasks, loading, addTask, completeTask, deleteTask, rescheduleTask } = useTasks("today");
  const { tasks: doneTasks } = useTasks("done-today");
  const router = useRouter();

  const [morningStep, setMorningStep]   = useState<"deal" | "focus" | null>(null);
  const [picked, setPicked]             = useState<Task[]>([]);
  const [swapPool, setSwapPool]         = useState<Task[]>([]);
  const [swapsLeft, setSwapsLeft]       = useState(3);
  const [showQueue, setShowQueue]       = useState(false);
  const [isAbsent, setIsAbsent]         = useState(false);

  // ── Morning deal gate ──────────────────────────────────────────────────────
  useEffect(() => {
    if (loading || tasks.length === 0) return;
    const today = new Date().toDateString();
    const lastSeen = localStorage.getItem("focus_morning_date");
    if (lastSeen === today) return; // already done morning deal today

    const last = localStorage.getItem("focus_last_open");
    if (last && (Date.now() - parseInt(last)) / 86400000 >= 7) setIsAbsent(true);
    localStorage.setItem("focus_last_open", Date.now().toString());

    // Sort: priority 1 first, then by due_at, then by created_at
    const sorted = [...tasks].sort((a, b) => {
      if ((a.priority ?? 9) !== (b.priority ?? 9)) return (a.priority ?? 9) - (b.priority ?? 9);
      if (a.due_at && b.due_at) return a.due_at < b.due_at ? -1 : 1;
      if (a.due_at) return -1;
      if (b.due_at) return 1;
      return a.created_at < b.created_at ? -1 : 1;
    });

    setPicked(sorted.slice(0, FOCUS_LIMIT));
    setSwapPool(sorted.slice(FOCUS_LIMIT));
    setMorningStep("deal");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, tasks.length]);

  // ── K-07: auto-focus first row when in focus view ─────────────────────────
  useEffect(() => {
    if (morningStep !== "focus") return;
    requestAnimationFrame(() => {
      const first = listRef.current?.querySelector<HTMLElement>("[data-task-id]");
      first?.focus();
    });
  }, [morningStep]);

  const acceptDeal = useCallback(() => {
    localStorage.setItem("focus_morning_date", new Date().toDateString());
    setMorningStep("focus");
  }, []);

  const swapCard = useCallback((index: number) => {
    if (swapsLeft <= 0 || swapPool.length === 0) return;
    const next = swapPool[0];
    const displaced = picked[index];
    setPicked((prev) => prev.map((c, i) => i === index ? next : c));
    setSwapPool((prev) => [displaced, ...prev.slice(1)]);
    setSwapsLeft((n) => n - 1);
  }, [swapsLeft, swapPool, picked]);

  // ── Focus view tasks: show picked + optional queue ─────────────────────────
  const focusTasks   = morningStep === "focus" ? picked.filter((t) => !t.completed_at) : tasks.filter((t) => !t.completed_at).slice(0, FOCUS_LIMIT);
  const queueTasks   = morningStep === "focus" ? swapPool.filter((t) => !t.completed_at) : tasks.filter((t) => !t.completed_at).slice(FOCUS_LIMIT);
  const toGo         = focusTasks.length;
  const today        = new Date();
  const dateLabel    = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  // ── Morning deal ──────────────────────────────────────────────────────────
  if (morningStep === "deal") return (
    <div style={{ padding: "32px 20px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
          {isAbsent ? "Welcome back." : "Good morning."}
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          {isAbsent
            ? "Here are 3 good tasks to restart with."
            : `We picked your top ${Math.min(FOCUS_LIMIT, tasks.length)} tasks. Swap any before you start.`}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {picked.map((card, i) => (
          <div key={card.id}
            style={{ background: "var(--bg-elevated)", borderRadius: 8, padding: "14px 16px", border: "1px solid var(--border)", display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                {card.priority === 1 && <span style={{ fontSize: 11, color: "var(--accent-red)", fontWeight: 600 }}>HIGH</span>}
                {card.due_at && (() => {
                  const d = new Date(card.due_at);
                  const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
                  const label = diff < 0 ? "overdue" : diff === 0 ? "today" : diff === 1 ? "tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                  const color = diff <= 0 ? "var(--accent-amber)" : "var(--text-muted)";
                  return <span style={{ fontSize: 11, color }}>📅 {label}</span>;
                })()}
                {card.tags.map((t) => <span key={t} className="tag-chip" style={{ fontSize: 11 }}>#{t}</span>)}
              </div>
              <div style={{ fontSize: 15, color: "var(--text-primary)", fontWeight: 500 }}>{card.title}</div>
            </div>
            <button onClick={() => swapCard(i)} disabled={swapsLeft <= 0 || swapPool.length === 0}
              title={swapsLeft > 0 ? "Swap for another task" : "No more swaps"}
              style={{ padding: "4px 10px", background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", fontSize: 13, color: swapsLeft > 0 ? "var(--text-muted)" : "var(--text-muted)", cursor: swapsLeft > 0 ? "pointer" : "not-allowed", opacity: swapsLeft > 0 ? 1 : 0.4, flexShrink: 0 }}
              aria-label={`Swap "${card.title}" for a different task`}>
              ↺
            </button>
          </div>
        ))}
      </div>

      {/* Swap dots */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20, fontSize: 12, color: "var(--text-muted)" }}>
        {[0,1,2].map((i) => (
          <span key={i} className={`swap-dot swap-dot--${i < (3 - swapsLeft) ? "used" : "empty"}`} />
        ))}
        <span style={{ marginLeft: 6 }}>
          {swapsLeft > 0 ? `${swapsLeft} swap${swapsLeft !== 1 ? "s" : ""} left` : "no more swaps"}
        </span>
      </div>

      <button onClick={acceptDeal} autoFocus
        style={{ width: "100%", padding: "14px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontSize: 16, fontWeight: 800, border: "none", cursor: "pointer", marginBottom: 10 }}>
        Start with {picked.length} →
      </button>
      <button onClick={() => router.push("/app/inbox")}
        style={{ width: "100%", padding: "10px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}>
        See all {tasks.length} tasks in inbox
      </button>
    </div>
  );

  // ── Focus view ─────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "baseline", gap: 8, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Today</h1>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{dateLabel}</span>
        </div>
        {morningStep === "focus" && (
          <button onClick={() => setMorningStep("deal")}
            style={{ fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
            title="Re-open morning pick">
            ↻ repick
          </button>
        )}
      </div>

      {/* Done wall */}
      <DoneWall doneTasks={doneTasks} toGo={toGo} wallRef={wallRef} />

      {loading ? (
        <div style={{ padding: 20, color: "var(--text-muted)" }}>Loading…</div>
      ) : (
        <>
          {/* Focus 3 */}
          <ul ref={listRef} role="list" aria-label="Today's focus tasks" style={{ listStyle: "none" }}>
            {focusTasks.length === 0 && (
              <li style={{ padding: "32px 16px", textAlign: "center" }}>
                {doneTasks.length > 0 ? (
                  <p style={{ color: "var(--accent-green)", fontSize: 16, fontWeight: 700 }}>
                    All done today! {doneTasks.length} task{doneTasks.length !== 1 ? "s" : ""} completed ✓
                  </p>
                ) : (
                  <>
                    <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 10 }}>
                      Nothing queued for today.
                    </p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                      Add your first task above ↑ or press{" "}
                      <kbd style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 4, padding: "1px 6px", fontFamily: "monospace", fontSize: 12 }}>
                        ⌘K
                      </kbd>{" "}
                      anywhere.
                    </p>
                  </>
                )}
              </li>
            )}
            {focusTasks.map((task) => (
              <TaskRow key={task.id} task={task} wallRef={wallRef} onComplete={completeTask} onDelete={deleteTask} />
            ))}
          </ul>

          {/* Queue toggle */}
          {queueTasks.length > 0 && (
            <div>
              <button onClick={() => setShowQueue((s) => !s)}
                style={{ width: "100%", padding: "8px 16px", background: "none", border: "none", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ transform: showQueue ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 120ms" }}>›</span>
                {showQueue ? "Hide" : "Show"} {queueTasks.length} queued task{queueTasks.length !== 1 ? "s" : ""}
              </button>
              {showQueue && (
                <ul role="list" aria-label="Queued tasks" style={{ listStyle: "none", opacity: 0.7 }}>
                  {queueTasks.map((task) => (
                    <TaskRow key={task.id} task={task} wallRef={wallRef} onComplete={completeTask} onDelete={deleteTask} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <CaptureBar onAdd={addTask} />
    </div>
  );
}
