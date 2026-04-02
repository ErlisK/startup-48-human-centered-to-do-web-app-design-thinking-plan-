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
}

function getDueInfo(due_at: string | null): { label: string; color: string; urgent: boolean } | null {
  if (!due_at) return null;
  const d    = new Date(due_at);
  const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
  if (diff < 0)   return { label: "overdue",   color: "var(--accent-red)",   urgent: true };
  if (diff === 0)  return { label: "due today", color: "var(--accent-amber)", urgent: true };
  if (diff === 1)  return { label: "tomorrow",  color: "var(--accent-amber)", urgent: false };
  if (diff <= 3)   return { label: d.toLocaleDateString("en-US", { weekday: "short" }), color: "var(--accent-amber)", urgent: false };
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "var(--text-muted)", urgent: false };
}

export function TaskRow({ task, wallRef, onComplete, onDelete }: Props) {
  const rowRef             = useRef<HTMLLIElement>(null);
  const [deleting, setDeleting]   = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const router    = useRouter();
  const dueInfo   = getDueInfo(task.due_at);

  const priorityLabel = task.priority === 1 ? "high priority" : task.priority === 2 ? "medium priority" : "";
  const tagsLabel     = task.tags.length ? `tagged ${task.tags.join(", ")}` : "";
  const ariaLabel     = [
    task.title,
    priorityLabel,
    dueInfo ? `due ${dueInfo.label}` : "",
    tagsLabel,
  ].filter(Boolean).join(", ");

  const handleComplete = useCallback(async () => {
    if (wallRef.current && rowRef.current) {
      await animateCompletion(rowRef.current, wallRef.current);
    }
    await onComplete(task.id);
  }, [task.id, onComplete, wallRef]);

  const startDelete = useCallback(() => {
    setDeleting(true);
    setCountdown(3);
    countRef.current = setInterval(() => setCountdown((n) => Math.max(0, n - 1)), 1000);
    timerRef.current = setTimeout(() => {
      setDeleting(false);
      clearInterval(countRef.current!);
    }, 3100);
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
      if (e.key === "Enter")  { e.preventDefault(); void confirmDelete(); }
      if (e.key === "Escape") { e.preventDefault(); cancelDelete(); }
      return;
    }
    // Space = complete (like checkbox)
    if (e.key === " ")                          { e.preventDefault(); void handleComplete(); }
    // Backspace/Delete = delete with confirm
    if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); startDelete(); }
    // Arrow row navigation
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = rowRef.current?.nextElementSibling as HTMLElement | null;
      next?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = rowRef.current?.previousElementSibling as HTMLElement | null;
      prev?.focus();
    }
    // Home / End
    if (e.key === "Home") {
      e.preventDefault();
      const list = rowRef.current?.closest('[role="list"]');
      (list?.firstElementChild as HTMLElement | null)?.focus();
    }
    if (e.key === "End") {
      e.preventDefault();
      const list = rowRef.current?.closest('[role="list"]');
      (list?.lastElementChild as HTMLElement | null)?.focus();
    }
  }, [deleting, handleComplete, confirmDelete, cancelDelete, startDelete]);

  return (
    <li
      ref={rowRef}
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-task-id={task.id}
      data-title={task.title}
      className={`task-row${deleting ? " task-row--delete-confirm" : ""}${dueInfo?.urgent ? " task-row--urgent" : ""}`}
      aria-label={ariaLabel}
      aria-describedby={deleting ? `delete-confirm-${task.id}` : undefined}
    >
      {/* Visible checkbox — tabIndex=-1 because the row itself is the interactive element */}
      <span
        role="checkbox"
        aria-checked="false"
        aria-label={`Complete "${task.title}"`}
        tabIndex={-1}
        onClick={() => void handleComplete()}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); void handleComplete(); } }}
        className="task-checkbox"
        style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${dueInfo?.urgent ? dueInfo.color : "var(--text-muted)"}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}
      />

      {/* Title */}
      <span style={{ flex: 1, fontSize: 15, color: "var(--text-primary)", wordBreak: "break-word" }}>
        {task.title}
      </span>

      {/* Priority pip */}
      {task.priority === 1 && (
        <span role="img" aria-label="High priority"
          style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-red)", flexShrink: 0, alignSelf: "center" }} />
      )}
      {task.priority === 2 && (
        <span role="img" aria-label="Medium priority"
          style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-amber)", flexShrink: 0, alignSelf: "center" }} />
      )}

      {/* Due date */}
      {dueInfo && (
        <span style={{ fontSize: 12, color: dueInfo.color, fontWeight: dueInfo.urgent ? 600 : 400, flexShrink: 0 }}>
          <span className="sr-only">Due: </span>{dueInfo.label}
        </span>
      )}

      {/* Tags — CW-009: tappable filter shortcuts */}
      {task.tags.map((tag) => (
        <button key={tag}
          className="tag-chip"
          onClick={(e) => { e.stopPropagation(); router.push(`/app/inbox?tag=${encodeURIComponent(tag)}`); }}
          aria-label={`Filter by tag: ${tag}`}
          tabIndex={-1}>
          #{tag}
        </button>
      ))}

      {/* Delete confirmation — inline, no modal (HV-009) */}
      {deleting && (
        <div
          id={`delete-confirm-${task.id}`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{ position: "absolute", inset: 0, background: "rgba(26,5,5,0.97)", display: "flex", alignItems: "center", padding: "0 14px", gap: 10, borderLeft: "3px solid var(--accent-red)", zIndex: 2, borderRadius: "var(--radius)" }}>
          <span style={{ flex: 1, fontSize: 13, color: "var(--text-primary)" }}>
            Delete &ldquo;{task.title.length > 30 ? task.title.slice(0, 30) + "…" : task.title}&rdquo;?
          </span>
          <button
            onClick={() => void confirmDelete()}
            aria-label={`Confirm delete "${task.title}"`}
            style={{ padding: "4px 10px", background: "var(--accent-red)", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
            Delete
          </button>
          <button
            onClick={cancelDelete}
            aria-label="Cancel delete"
            autoFocus
            style={{ padding: "4px 10px", background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>
            Cancel
          </button>
          <span aria-label={`Auto-cancel in ${countdown} seconds`} style={{ fontSize: 12, color: "var(--accent-amber)", minWidth: 20, textAlign: "right" }}>{countdown}s</span>
        </div>
      )}
    </li>
  );
}
