"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { parseNlp, type NlpResult } from "@/lib/nlp/parse";
import { useToast } from "@/components/ui/Toast";
import type { Task } from "@/lib/supabase/types";

interface CaptureBarProps {
  defaultTag?: string;
  onAdd: (partial: Omit<Task, "id" | "user_id" | "created_at" | "completed_at" | "deleted_at">) => Promise<Task>;
}

export function CaptureBar({ defaultTag, onAdd }: CaptureBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(defaultTag ? `#${defaultTag} ` : "");
  const [nlp, setNlp] = useState<NlpResult | null>(null);
  const [shaking, setShaking] = useState(false);
  const [postHint, setPostHint] = useState(false);
  const [hintText, setHintText] = useState("");
  const lastValueRef = useRef("");
  const { showToast } = useToast();

  // K-05: Auto-focus + reclaim on window focus
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

  // HV-015: Esc to edit last added
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        // HV-010: shake on empty
        setShaking(true);
        setTimeout(() => setShaking(false), 220);
        return;
      }
      const parsed = nlp ?? parseNlp(value);
      lastValueRef.current = value;
      try {
        const task = await onAdd({
          title: parsed.cleanTitle || value.trim(),
          tags: parsed.tags.length ? parsed.tags : (defaultTag ? [defaultTag] : []),
          priority: parsed.priority === "high" ? 1 : parsed.priority === "medium" ? 2 : null,
          due_at: parsed.date,
          time_estimate_minutes: parsed.durationMinutes,
        });
        // HV-001: save toast
        showToast({ message: `✓ ${task.title} — added`, duration: 2500 });
        // HV-015: post-confirm hint
        setHintText("Esc to edit last added");
        setPostHint(true);
        setTimeout(() => { setPostHint(false); setHintText(""); }, 3000);
        // HV-018: NLP parse error hint
        if (parsed.unparsedTokens.length) {
          showToast({ message: `Didn't recognise "${parsed.unparsedTokens[0]}" — saved without due date.`, duration: 4000, variant: "amber" });
        }
        setValue(defaultTag ? `#${defaultTag} ` : "");
        setNlp(null);
      } catch {
        showToast({ message: "Saved locally — will sync when online", duration: 0, variant: "amber" });
      }
    }
  }, [value, nlp, onAdd, defaultTag, postHint, showToast]);

  return (
    <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-base)" }}>
      {/* NLP preview row */}
      {nlp && (nlp.date || nlp.priority || nlp.tags.length > 0 || nlp.unparsedTokens.length > 0) && (
        <div style={{ padding: "4px 14px", display: "flex", gap: 8, flexWrap: "wrap", background: "var(--bg-surface)", borderBottom: "1px solid var(--border)" }}>
          {nlp.date && <span className="tag-chip" style={{ background: "#1a1f00", color: "var(--accent-amber)" }}>📅 {nlp.dateLabel}</span>}
          {nlp.ambiguousDate && <span className="tag-chip" style={{ background: "#1a1f00", color: "var(--accent-amber)" }}>📅 {nlp.ambiguousDate}?</span>}
          {nlp.priority === "high" && <span className="tag-chip" style={{ background: "#2a0505", color: "var(--accent-red)" }}>🔴 High</span>}
          {nlp.priority === "medium" && <span className="tag-chip" style={{ background: "#2a1a00", color: "var(--accent-amber)" }}>🟡 Medium</span>}
          {nlp.tags.map((t) => <span key={t} className="tag-chip">#{t}</span>)}
          {/* HV-018: wavy underline for unparsed */}
          {nlp.unparsedTokens.map((t) => <span key={t} className="nlp-token-unparsed" style={{ fontSize: 13 }}>{t}</span>)}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>↵ save</span>
        </div>
      )}
      <input ref={inputRef} value={value} onChange={handleChange} onKeyDown={handleKeyDown}
        className={`capture-bar${shaking ? " capture-bar--shake" : ""}`}
        placeholder="type a task, then press Enter ↵"
        aria-label="Capture a task"
        data-testid="capture-bar"
      />
      <div style={{ padding: "3px 14px", fontSize: 11, color: "var(--text-muted)" }}>
        {postHint ? hintText : "@ = due  ·  # = tag  ·  ! = priority  ·  ~30m = estimate"}
      </div>
    </div>
  );
}
