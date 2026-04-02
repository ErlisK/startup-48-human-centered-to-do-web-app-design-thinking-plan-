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
  showKbdHint?: boolean;
}

function getDueInfo(due_at: string | null): { label: string; color: string; urgent: boolean } | null {
  if (!due_at) return null;
  const d = new Date(due_at);
  const diff = Math.floor((d.getTime() - Date.now()) / 86400000);
  if (diff < 0)  return { label: "overdue",   color: "var(--accent-red)",   urgent: true };
  if (diff === 0) return { label: "today",     color: "var(--accent-amber)", urgent: true };
  if (diff === 1) return { label: "tomorrow",  color: "var(--accent-amber)", urgent: false };
  if (diff <= 3)  return { label: d.toLocaleDateString("en-US", { weekday: "short" }), color: "var(--accent-amber)", urgent: false };
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "var(--text-muted)", urgent: false };
}

export function TaskRow({ task, wallRef, onComplete, onDelete }: Props) {
  const rowRef   = useRef<HTMLLIElement>(null);
  const [deleting, setDeleting]   = useState(false);
  const [countdown, setCountdown] = useState(3);
  const timerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const router    = useRouter();
  const dueInfo   = getDueInfo(task.due_at);

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
    if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); startDelete(); }
    // Arrow nav between rows
    if (e.key === "ArrowDown") { e.preventDefault(); (rowRef.current?.nextElementSibling as HTMLElement)?.focus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); (rowRef.current?.previousElementSibling as HTMLElement)?.focus(); }
  }, [deleting, handleComplete, confirmDelete, cancelDelete, startDelete]);

  return (
    <li ref={rowRef} role="listitem" tabIndex={0} onKeyDown={handleKeyDown}
      data-task-id={task.id}
      className={`task-row${deleting ? " task-row--delete-confirm" : ""}${dueInfo?.urgent ? " task-row--urgent" : ""}`}
      aria-label={`${task.title}${dueInfo ? `, ${dueInfo.label}` : ""}`}
    >
      {/* Checkbox */}
      <button onClick={() => void handleComplete()} tabIndex={-1}
        className="task-checkbox"
        aria-label={`Complete "${task.title}"`}
        style={{ width: 20, height: 20, borderRadius: 4, border: `2px solid ${dueInfo?.urgent ? dueInfo.color : "var(--text-muted)"}`, background: "transparent", flexShrink: 0, cursor: "pointer" }}
      />

      {/* Title */}
      <span style={{ flex: 1, fontSize: 15, color: "var(--text-primary)", wordBreak: "break-word" }}>{task.title}</span>

      {/* Priority pip */}
      {task.priority === 1 && (
        <span aria-label="High priority" title="High priority"
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-red)", flexShrink: 0, alignSelf: "center" }} />
      )}
      {task.priority === 2 && (
        <span aria-label="Medium priority" title="Medium priority"
          style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-amber)", flexShrink: 0, alignSelf: "center" }} />
      )}

      {/* Due label */}
      {dueInfo && (
        <span style={{ fontSize: 12, color: dueInfo.color, fontWeight: dueInfo.urgent ? 600 : 400, flexShrink: 0 }}
          aria-label={`Due ${dueInfo.label}`}>
          {dueInfo.label}
        </span>
      )}

      {/* Tags */}
      {task.tags.map((tag) => (
        <button key={tag} className="tag-chip"
          onClick={(e) => { e.stopPropagation(); router.push(`/app/inbox?tag=${encodeURIComponent(tag)}`); }}
          aria-label={`Filter by tag ${tag}`} tabIndex={-1}>
          #{tag}
        </button>
      ))}

      {/* Delete confirm overlay (HV-009) */}
      {deleting && (
        <div style={{ position: "absolute", inset: 0, background: "#1a0505", display: "flex", alignItems: "center", padding: "0 14px", gap: 10, borderLeft: "3px solid var(--accent-red)", zIndex: 2, borderRadius: "var(--radius)" }}
          role="alert" aria-live="assertive">
          <span style={{ flex: 1, fontSize: 13, color: "var(--text-secondary)" }}>
            Delete &ldquo;{task.title.length > 35 ? task.title.slice(0, 35) + "…" : task.title}&rdquo;?
          </span>
          <kbd style={{ fontSize: 11, color: "var(--accent-red)", background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 3 }}>↩ delete</kbd>
          <kbd style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 3 }}>Esc cancel</kbd>
          <span style={{ fontSize: 12, color: "var(--accent-amber)", minWidth: 16 }}>{countdown}s</span>
        </div>
      )}
    </li>
  );
}
