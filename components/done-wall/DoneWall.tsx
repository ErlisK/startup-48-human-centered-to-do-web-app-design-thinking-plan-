"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import type { Task } from "@/lib/supabase/types";

function tileColour(id: string) {
  const colours = ["#2e86de","#e67e22","#2ecc71","#9b59b6","#f39c12","#1abc9c","#e74c3c","#3498db"];
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return colours[hash % colours.length];
}

interface DoneWallProps {
  doneTasks: Task[];
  toGo: number;
  wallRef: React.RefObject<HTMLElement | null>;
}

export function DoneWall({ doneTasks, toGo, wallRef }: DoneWallProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<Task | null>(null);
  const prevCountRef = useRef(0);

  // CW-005: One-time orientation tooltip after first tile lands
  useEffect(() => {
    if (doneTasks.length === 1 && prevCountRef.current === 0) {
      const shown = localStorage.getItem("focus_hints_done_wall");
      if (!shown) {
        setShowTooltip(true);
        localStorage.setItem("focus_hints_done_wall", "1");
        setTimeout(() => setShowTooltip(false), 3000);
      }
    }
    prevCountRef.current = doneTasks.length;
  }, [doneTasks.length]);

  return (
    <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Done today ✓</span>
        {/* HV-003: key change triggers bounce animation */}
        <span key={doneTasks.length} className="done-count-badge"
          style={{ fontSize: 11, color: doneTasks.length > 0 ? "var(--accent-green)" : "var(--text-muted)" }}
          aria-live="polite" aria-atomic="true">
          {doneTasks.length} done · {toGo} to go
        </span>
      </div>
      <div ref={wallRef as React.RefObject<HTMLDivElement>}
        className={`done-wall${doneTasks.length === 0 ? " done-wall--empty" : ""}`}
        aria-label={`${doneTasks.length} tasks completed today`}
        style={{ minHeight: 32 }}>
        {doneTasks.length === 0 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center" }}>
            Complete a task to start your wall
          </span>
        )}
        {doneTasks.map((task) => (
          <div key={task.id}
            className="done-tile"
            style={{ background: tileColour(task.id) }}
            title={`${task.title} — completed ${new Date(task.completed_at!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
            onMouseEnter={() => setHoveredTask(task)}
            onMouseLeave={() => setHoveredTask(null)}
            role="img"
            aria-label={task.title}
          />
        ))}
      </div>
      {/* CW-005: Orientation tooltip */}
      {showTooltip && (
        <div style={{ position: "absolute", top: "100%", left: 14, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 10px", fontSize: 12, color: "var(--text-secondary)", zIndex: 20, maxWidth: 260 }}
          role="status" aria-live="assertive">
          Your completions live here. They build up all day.
        </div>
      )}
    </div>
  );
}
