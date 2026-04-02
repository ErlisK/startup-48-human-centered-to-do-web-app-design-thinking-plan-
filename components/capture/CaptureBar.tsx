"use client";
import { useRef, useState, useCallback, useEffect, useId } from "react";
import { parseNlp, type NlpResult } from "@/lib/nlp/parse";
import { useToast } from "@/components/ui/Toast";
import type { Task } from "@/lib/supabase/types";

interface CaptureBarProps {
  defaultTag?: string;
  onAdd: (partial: Omit<Task, "id" | "user_id" | "created_at" | "completed_at" | "deleted_at">) => Promise<Task>;
}

export function CaptureBar({ defaultTag, onAdd }: CaptureBarProps) {
  const inputRef     = useRef<HTMLInputElement>(null);
  const statusId     = useId();   // for aria-describedby on NLP preview
  const [value, setValue]       = useState(defaultTag ? `#${defaultTag} ` : "");
  const [nlp, setNlp]           = useState<NlpResult | null>(null);
  const [shaking, setShaking]   = useState(false);
  const [postHint, setPostHint] = useState(false);
  const [saving, setSaving]     = useState(false);
  const lastValueRef            = useRef("");
  const { showToast }           = useToast();

  // K-05: Auto-focus capture bar + reclaim focus when window regains focus
  useEffect(() => {
    inputRef.current?.focus();
    const reclaim = () => {
      if (!document.querySelector('[role="dialog"]')) inputRef.current?.focus();
    };
    window.addEventListener("focus", reclaim);
    return () => window.removeEventListener("focus", reclaim);
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    setNlp(v.trim() ? parseNlp(v) : null);
  }, []);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // HV-015: Esc within 3s edits last added task
    if (e.key === "Escape" && postHint && lastValueRef.current) {
      e.preventDefault();
      setValue(lastValueRef.current);
      setNlp(parseNlp(lastValueRef.current));
      setPostHint(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (!value.trim()) {
        setShaking(true);
        setTimeout(() => setShaking(false), 220);
        // Announce to screen readers
        return;
      }
      await doSave();
    }
  }, [value, nlp, postHint]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSave = useCallback(async () => {
    const parsed = nlp ?? parseNlp(value);
    setSaving(true);
    lastValueRef.current = value;
    try {
      const task = await onAdd({
        title:                 parsed.cleanTitle || value.trim(),
        tags:                  parsed.tags.length ? parsed.tags : (defaultTag ? [defaultTag] : []),
        priority:              parsed.priority === "high" ? 1 : parsed.priority === "medium" ? 2 : null,
        due_at:                parsed.date,
        time_estimate_minutes: parsed.durationMinutes,
      });
      showToast({ message: `✓ "${task.title}" added`, duration: 2500 });
      if (parsed.unparsedTokens.length) {
        showToast({ message: `Couldn't parse "${parsed.unparsedTokens[0]}" — saved without due date`, duration: 4000, variant: "amber" });
      }
      setPostHint(true);
      setTimeout(() => setPostHint(false), 3000);
      setValue(defaultTag ? `#${defaultTag} ` : "");
      setNlp(null);
    } catch {
      showToast({ message: "Saved offline — will sync when connected", duration: 3000, variant: "amber" });
    } finally { setSaving(false); }
  }, [value, nlp, defaultTag, onAdd, showToast]);

  const hasPreview = nlp && (nlp.date || nlp.tags.length > 0 || nlp.priority || nlp.durationMinutes || nlp.unparsedTokens.length > 0);
  const dateLabel = nlp?.date ? new Date(nlp.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : null;

  return (
    <section aria-label="Capture bar"
      style={{ position: "sticky", bottom: 0, zIndex: 30, background: "var(--bg-base)", borderTop: "1px solid var(--border)" }}
      className="capture-bar-wrapper">

      {/* NLP preview — announced to screen readers via aria-live */}
      {hasPreview && (
        <div id={statusId} role="status" aria-live="polite" aria-atomic="true"
          style={{ padding: "4px 14px 0", display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12 }}>
          {dateLabel && (
            <span style={{ color: "var(--accent-blue)" }} aria-label={`Due date: ${dateLabel}`}>
              📅 {dateLabel}
            </span>
          )}
          {nlp?.ambiguousDate && (
            <span style={{ color: "var(--accent-amber)" }} aria-label="Ambiguous date — please clarify">
              ⚠ {nlp.ambiguousDate}?
            </span>
          )}
          {nlp?.priority === "high"   && <span style={{ color: "var(--accent-red)"   }} aria-label="Priority: high">🔴 high</span>}
          {nlp?.priority === "medium" && <span style={{ color: "var(--accent-amber)" }} aria-label="Priority: medium">🟡 medium</span>}
          {nlp?.durationMinutes && (
            <span style={{ color: "var(--text-muted)" }} aria-label={`Estimated duration: ${nlp.durationMinutes} minutes`}>
              ⏱ {nlp.durationMinutes >= 60 ? `${nlp.durationMinutes / 60}h` : `${nlp.durationMinutes}m`}
            </span>
          )}
          {nlp?.tags.map((t) => (
            <span key={t} className="tag-chip" aria-label={`Tag: ${t}`}>#{t}</span>
          ))}
          {nlp?.unparsedTokens.map((t) => (
            <span key={t} className="nlp-token-unparsed" aria-label={`Could not parse: ${t}`}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        <label htmlFor="capture-input" className="sr-only">
          Add a task. Use # for tags, ! for high priority, @date for due date, ~30m for duration.
        </label>
        <input
          id="capture-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder='Add a task — "review PR @fri ! #work ~30m"'
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={saving}
          aria-describedby={hasPreview ? statusId : undefined}
          aria-label="Add a task"
          aria-busy={saving}
          className={`capture-bar${shaking ? " capture-bar--shake" : ""}`}
          style={{ flex: 1 }}
        />
        <button
          onClick={doSave}
          disabled={saving || !value.trim()}
          aria-label={saving ? "Saving…" : "Save task"}
          style={{ padding: "10px 14px", background: "var(--accent-green)", color: "#0d1117", border: "none", cursor: saving || !value.trim() ? "default" : "pointer", fontSize: 16, fontWeight: 700, opacity: !value.trim() ? 0.4 : 1, transition: "opacity 120ms", flexShrink: 0 }}>
          {saving ? "…" : "↵"}
        </button>
      </div>

      {/* Keyboard hints */}
      <div style={{ padding: "3px 14px 6px", fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 14, flexWrap: "wrap" }} aria-hidden="true">
        {postHint
          ? <span>✓ saved · <kbd>Esc</kbd> to edit</span>
          : <span><kbd>↵</kbd> save · <kbd>#tag</kbd> · <kbd>!</kbd> priority · <kbd>@fri</kbd> date · <kbd>~30m</kbd> duration</span>
        }
      </div>
    </section>
  );
}
