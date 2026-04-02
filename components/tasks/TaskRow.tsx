"use client";
import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { animateCompletion } from "@/lib/animation/completion";
import type { Task } from "@/lib/supabase/types";

interface Props {
  task: Task;
  wallRef: React.RefObject<HTMLElement | null>;
  onComplete: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReschedule?: (id: string, dueAt: string | null) => Promise<void>;
  showKbdHint?: boolean;
}

// Deterministic tile colour from task id
function tileColour(id: string) {
  const colours = ["#2e86de","#e67e22","#2ecc71","#9b59b6","#f39c12","#1abc9c","#e74c3c","#3498db"];
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colours[hash % colours.length];
}

export function TaskRow({ task, wallRef, onComplete, onDelete, showKbdHint }: Props) {
  const rowRef = useRef<HTMLLIElement>(null);
  const [deleting, setDeleting] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const handleComplete = useCallback(async () => {
    if (wallRef.current && rowRef.current) {
      await animateCompletion(rowRef.current, wallRef.current);
    }
    await onComplete(task.id);
  }, [task.id, onComplete, wallRef]);

  const startDelete = useCallback(() => {
    setDeleting(true); setCountdown(3);
    countRef.current = setInterval(() => setCountdown((n) => Math.max(0, n - 1)), 1000);
    timerRef.current = setTimeout(() => { setDeleting(false); clearInterval(countRef.current!); }, 3100);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleting(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
    rowRef.current?.focus();
  }, []);

  const confirmDelete = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
    setDeleting(false);
    await onDelete(task.id);
  }, [task.id, onDelete]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (deleting) {
      if (e.key === "Enter") { e.preventDefault(); void confirmDelete(); }
      if (e.key === "Escape") { e.preventDefault(); cancelDelete(); }
      return;
    }
    if (e.key === " ") { e.preventDefault(); void handleComplete(); }
    if (e.key === "Backspace") { e.preventDefault(); startDelete(); }
  }, [deleting, handleComplete, confirmDelete, cancelDelete, startDelete]);

  const dueLabel = task.due_at ? (() => {
    const d = new Date(task.due_at);
    const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
    if (diff < 0) return { text: "overdue", color: "var(--accent-amber)" };
    if (diff === 0) return { text: "today", color: "var(--accent-amber)" };
    if (diff === 1) return { text: "tomorrow", color: "var(--text-muted)" };
    return { text: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), color: "var(--text-muted)" };
  })() : null;

  return (
    <li ref={rowRef} role="listitem" tabIndex={0} onKeyDown={handleKeyDown}
      data-task-id={task.id} data-title={task.title}
      className={`task-row${deleting ? " task-row--delete-confirm" : ""}`}
      style={{ background: deleting ? "#1a0505" : undefined }}
      aria-label={task.title}
    >
      <button onClick={() => void handleComplete()} tabIndex={-1}
        className="task-checkbox"
        style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid var(--text-muted)", background: "transparent", flexShrink: 0, cursor: "pointer" }}
        aria-label={`Complete ${task.title}`}
      />
      <span style={{ flex: 1, fontSize: 15, color: "var(--text-primary)" }}>{task.title}</span>
      {dueLabel && <span style={{ fontSize: 12, color: dueLabel.color }}>{dueLabel.text}</span>}
      {task.priority === 1 && <span aria-label="High priority" style={{ fontSize: 12 }}>🔴</span>}
      {task.tags.map((tag) => (
        <button key={tag} className="tag-chip" onClick={(e) => { e.stopPropagation(); router.push(`/app/inbox?tag=${encodeURIComponent(tag)}`); }}
          aria-label={`Filter by tag ${tag}`} tabIndex={-1}>
          #{tag}
        </button>
      ))}
      {deleting && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "var(--bg-surface)", padding: "4px 14px", fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12, zIndex: 10 }}>
          <span>Delete &ldquo;{task.title.slice(0, 30)}{task.title.length > 30 ? "…" : ""}&rdquo;?</span>
          <kbd>↩ confirm</kbd><kbd>Esc cancel</kbd>
          <span style={{ marginLeft: "auto", color: "var(--accent-amber)" }}>{countdown}s</span>
        </div>
      )}
    </li>
  );
}
