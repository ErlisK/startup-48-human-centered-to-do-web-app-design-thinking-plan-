"use client";
import { useEffect, useRef, useState } from "react";
import type { Task } from "@/lib/supabase/types";

const TILE_COLOURS = ["#2e86de","#e67e22","#2ecc71","#9b59b6","#f39c12","#1abc9c","#e74c3c","#3498db"];
function tileColour(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return TILE_COLOURS[hash % TILE_COLOURS.length];
}

interface DoneWallProps {
  doneTasks: Task[];
  toGo: number;
  wallRef: React.RefObject<HTMLElement | null>;
}

export function DoneWall({ doneTasks, toGo, wallRef }: DoneWallProps) {
  const [tooltip, setTooltip]   = useState(false);
  const [focusedTile, setFocusedTile] = useState<Task | null>(null);
  const prevCountRef            = useRef(0);
  const countId                 = "done-wall-count";
  const tooltipId               = "done-wall-tooltip";

  // Show one-time orientation tooltip on first tile
  useEffect(() => {
    if (doneTasks.length === 1 && prevCountRef.current === 0) {
      if (!localStorage.getItem("focus_hints_done_wall")) {
        setTooltip(true);
        localStorage.setItem("focus_hints_done_wall", "1");
        setTimeout(() => setTooltip(false), 3500);
      }
    }
    prevCountRef.current = doneTasks.length;
  }, [doneTasks.length]);

  const completedLabel = `${doneTasks.length} task${doneTasks.length !== 1 ? "s" : ""} completed today`;
  const toGoLabel      = toGo > 0 ? `, ${toGo} remaining` : "";

  return (
    <section
      aria-label="Daily progress"
      style={{ padding: "8px 14px", borderBottom: "1px solid var(--border)", position: "relative" }}>

      {/* Count — HV-003: key swap triggers animation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }} aria-hidden="true">Done today ✓</span>
        <span
          id={countId}
          key={doneTasks.length}
          className="done-count-badge"
          aria-live="polite"
          aria-atomic="true"
          style={{ fontSize: 11, color: doneTasks.length > 0 ? "var(--accent-green)" : "var(--text-muted)", fontWeight: 600 }}>
          {completedLabel}{toGoLabel}
        </span>
      </div>

      {/* Tile grid */}
      <div
        ref={wallRef as React.RefObject<HTMLDivElement>}
        role="list"
        aria-label={completedLabel}
        aria-describedby={tooltip ? tooltipId : undefined}
        className={`done-wall${doneTasks.length === 0 ? " done-wall--empty" : ""}`}
        style={{ minHeight: 36 }}>

        {doneTasks.length === 0 && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", alignSelf: "center", paddingLeft: 4 }} aria-live="polite">
            Complete a task to start your wall
          </span>
        )}

        {doneTasks.map((task) => {
          const time = task.completed_at
            ? new Date(task.completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";
          const tileLabel = `${task.title}${time ? `, completed at ${time}` : ""}`;
          return (
            <div
              key={task.id}
              role="listitem"
              tabIndex={0}
              className="done-tile done-tile--landing"
              style={{ background: tileColour(task.id) }}
              aria-label={tileLabel}
              title={tileLabel}
              onFocus={() => setFocusedTile(task)}
              onBlur={() => setFocusedTile(null)}
              onMouseEnter={() => setFocusedTile(task)}
              onMouseLeave={() => setFocusedTile(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") (e.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
                if (e.key === "ArrowLeft")  (e.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
              }}
            />
          );
        })}
      </div>

      {/* Focused tile tooltip */}
      {focusedTile && (
        <div
          role="tooltip"
          style={{ position: "absolute", top: "100%", left: 14, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "5px 10px", fontSize: 12, color: "var(--text-secondary)", zIndex: 20, maxWidth: 280, pointerEvents: "none" }}>
          {focusedTile.title}
          {focusedTile.completed_at && (
            <span style={{ color: "var(--text-muted)", marginLeft: 6 }}>
              · {new Date(focusedTile.completed_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      )}

      {/* Orientation tooltip (CW-005) */}
      {tooltip && (
        <div id={tooltipId} role="status" aria-live="assertive"
          style={{ position: "absolute", top: "100%", right: 14, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 10px", fontSize: 12, color: "var(--text-secondary)", zIndex: 20, maxWidth: 260 }}>
          Completed tasks build up here all day.
        </div>
      )}
    </section>
  );
}
