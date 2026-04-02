"use client";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useTasks } from "@/hooks/useTasks";
import { DoneWall } from "@/components/done-wall/DoneWall";
import { TaskRow } from "@/components/tasks/TaskRow";
import { CaptureBar } from "@/components/capture/CaptureBar";
import type { Task } from "@/lib/supabase/types";

const MAX_SWAPS = 3;

export default function TodayPage() {
  const wallRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { tasks, loading, syncState, queueCount, addTask, completeTask, deleteTask } = useTasks("today");
  const { tasks: doneTasks } = useTasks("done-today");
  const [morningCards, setMorningCards] = useState<Task[]>([]);
  const [swapCount, setSwapCount] = useState(0);
  const [showMorning, setShowMorning] = useState(false);
  const [allDealCards, setAllDealCards] = useState<Task[]>([]);
  const [isAbsent, setIsAbsent] = useState(false);
  const router = useRouter();

  // CW-010: Detect absence
  useEffect(() => {
    const last = localStorage.getItem("focus_last_open");
    if (last) {
      const days = (Date.now() - parseInt(last)) / 86400000;
      if (days >= 7) setIsAbsent(true);
    }
    localStorage.setItem("focus_last_open", Date.now().toString());
  }, []);

  // Show morning deal on first open of day
  useEffect(() => {
    const lastMorning = localStorage.getItem("focus_morning_date");
    const today = new Date().toDateString();
    if (lastMorning !== today && !loading && tasks.length > 0) {
      setShowMorning(true);
      setMorningCards(tasks.slice(0, 3));
      setAllDealCards(tasks);
    }
  }, [loading, tasks.length]);

  // K-07: Auto-focus first row on mount
  useEffect(() => {
    if (!showMorning && !loading) {
      requestAnimationFrame(() => {
        const firstRow = listRef.current?.querySelector<HTMLElement>("[role='listitem'][data-task-id]");
        firstRow?.focus();
      });
    }
  }, [showMorning, loading]);

  async function acceptDeal() {
    localStorage.setItem("focus_morning_date", new Date().toDateString());
    setShowMorning(false);
  }

  function swapCard(index: number) {
    if (swapCount >= MAX_SWAPS) return;
    const usedIds = morningCards.map((c) => c.id);
    const pool = allDealCards.filter((t) => !usedIds.includes(t.id));
    if (pool.length === 0) return;
    const next = pool[swapCount % pool.length];
    setMorningCards((prev) => prev.map((c, i) => (i === index ? next : c)));
    setSwapCount((n) => n + 1);
  }

  const toGo = tasks.filter((t) => !t.completed_at).length;
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  // ── Morning deal view (S11) ──
  if (showMorning) return (
    <div style={{ padding: "32px 20px", maxWidth: 500, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
        {isAbsent ? "Welcome back." : "Good morning."}
      </h1>
      {/* CW-003 / CW-010 */}
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
        {isAbsent ? "We picked 3 tasks to start with." : "We picked 3 tasks to focus on today."}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        {morningCards.map((card, i) => (
          <div key={card.id} className="deal-card">
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
              {card.due_at ? new Date(card.due_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "no date"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{card.title}</div>
            {card.tags.map((t) => <span key={t} className="tag-chip" style={{ marginRight: 4, fontSize: 11 }}>#{t}</span>)}
            {/* HV-004: Try a different task */}
            <button onClick={() => swapCard(i)} disabled={swapCount >= MAX_SWAPS}
              style={{ display: "block", marginTop: 8, fontSize: 12, color: "var(--text-muted)", background: "none", border: "none", cursor: swapCount < MAX_SWAPS ? "pointer" : "default" }}>
              Try a different task ↺
            </button>
          </div>
        ))}
      </div>
      {/* HV-011: Swap dots from initial render */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 16, fontSize: 12, color: "var(--text-muted)" }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`swap-dot swap-dot--${i < swapCount ? "used" : "empty"}`} />
        ))}
        {swapCount === 0 && <span style={{ marginLeft: 4 }}>swaps available</span>}
        {swapCount === MAX_SWAPS && <span style={{ marginLeft: 4 }}>no more swaps</span>}
      </div>
      <button onClick={acceptDeal} autoFocus
        style={{ width: "100%", padding: "14px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontSize: 16, fontWeight: 700, border: "none", cursor: "pointer" }}>
        Start with these {morningCards.length} →
      </button>
      <button onClick={() => { setShowMorning(false); router.push("/app/inbox"); }}
        style={{ display: "block", margin: "10px auto 0", fontSize: 13, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>
        See all {allDealCards.length} tasks
      </button>
    </div>
  );

  // ── Today view (S13) ──
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 14px 0", display: "flex", alignItems: "baseline", gap: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Today</h1>
        {/* HV-008: Date in header */}
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {dateLabel}</span>
      </div>
      <DoneWall doneTasks={doneTasks} toGo={toGo} wallRef={wallRef} />
      {loading ? (
        <div style={{ padding: 20, color: "var(--text-muted)" }}>Loading…</div>
      ) : (
        <ul ref={listRef} role="list" aria-label="Today's tasks" style={{ listStyle: "none", flex: 1 }}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} wallRef={wallRef}
              onComplete={completeTask} onDelete={deleteTask} />
          ))}
          {tasks.length === 0 && (
            <li style={{ padding: "24px 14px", color: "var(--text-muted)", fontSize: 14 }}>
              Nothing here yet. Add a task below.
            </li>
          )}
        </ul>
      )}
      <CaptureBar onAdd={addTask} />
    </div>
  );
}
