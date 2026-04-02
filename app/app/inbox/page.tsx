"use client";
import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTasks } from "@/hooks/useTasks";
import { TaskRow } from "@/components/tasks/TaskRow";
import { CaptureBar } from "@/components/capture/CaptureBar";
import { DoneWall } from "@/components/done-wall/DoneWall";
import { Suspense } from "react";

function InboxContent() {
  const wallRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const { tasks, loading, addTask, completeTask, deleteTask } = useTasks("inbox");
  const { tasks: doneTasks } = useTasks("done-today");
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);

  // K-07: focus first row
  useEffect(() => {
    if (!loading) requestAnimationFrame(() => {
      const first = listRef.current?.querySelector<HTMLElement>("[role='listitem'][data-task-id]");
      first?.focus();
    });
  }, [loading]);

  const filtered = tagFilter ? tasks.filter((t) => t.tags.includes(tagFilter)) : tasks;
  const toGo = tasks.filter((t) => !t.completed_at).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "12px 14px 0", display: "flex", alignItems: "center", gap: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Inbox</h1>
        {tagFilter && (
          <a href="/app/inbox" style={{ fontSize: 12, color: "var(--text-muted)", background: "#1a1a3a", padding: "2px 8px", borderRadius: 10, border: "1px solid #2a1a4a", textDecoration: "none" }}>
            × #{tagFilter}
          </a>
        )}
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>{tasks.length} tasks</span>
      </div>

      <DoneWall doneTasks={doneTasks} toGo={toGo} wallRef={wallRef} />

      {loading ? <div style={{ padding: 20, color: "var(--text-muted)" }}>Loading…</div> : (
        <ul ref={listRef} role="list" aria-label="Inbox tasks" style={{ listStyle: "none", flex: 1 }}>
          {filtered.map((task) => (
            <TaskRow key={task.id} task={task} wallRef={wallRef}
              onComplete={completeTask} onDelete={deleteTask}
              showKbdHint={focusedRowId === task.id}
            />
          ))}
          {filtered.length === 0 && tagFilter && (
            <li style={{ padding: "24px 14px", color: "var(--text-muted)", fontSize: 14 }}>
              No tasks tagged #{tagFilter} yet.<br />Add one below.
            </li>
          )}
          {filtered.length === 0 && !tagFilter && (
            <li style={{ padding: "24px 14px", color: "var(--text-muted)", fontSize: 14 }}>Inbox zero. Good.</li>
          )}
        </ul>
      )}

      {/* HV-012: keyboard hint bar on focus */}
      {focusedRowId && (
        <div className="kbd-hint-bar" role="region" aria-label="Keyboard shortcuts">
          <span><kbd>Space</kbd> complete</span>
          <span><kbd>T</kbd> today</span>
          <span><kbd>S</kbd> someday</span>
          <span><kbd>⌫</kbd> delete</span>
        </div>
      )}

      <CaptureBar defaultTag={tagFilter ?? undefined} onAdd={addTask} />
    </div>
  );
}

export default function InboxPage() {
  return <Suspense fallback={<div style={{ padding: 20, color: "var(--text-muted)" }}>Loading…</div>}><InboxContent /></Suspense>;
}
