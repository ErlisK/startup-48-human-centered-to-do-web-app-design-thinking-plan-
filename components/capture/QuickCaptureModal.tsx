"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { parseNlp, type NlpResult } from "@/lib/nlp/parse";
import { useToast } from "@/components/ui/Toast";
import type { Task } from "@/lib/supabase/types";

interface QuickCaptureModalProps {
  onAdd: (partial: Omit<Task, "id" | "user_id" | "created_at" | "completed_at" | "deleted_at">) => Promise<Task>;
}

export function QuickCaptureModal({ onAdd }: QuickCaptureModalProps) {
  const [open, setOpen]       = useState(false);
  const [value, setValue]     = useState("");
  const [nlp, setNlp]         = useState<NlpResult | null>(null);
  const [saving, setSaving]   = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const { showToast }         = useToast();

  // Open on Cmd+K / Ctrl+K from anywhere (when not already in an input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        // Don't steal Cmd+K if user is in a native input for other purposes
        const tag = (document.activeElement as HTMLElement)?.tagName;
        if (tag === "TEXTAREA") return;
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 20);
    else { setValue(""); setNlp(null); }
  }, [open]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValue(v);
    setNlp(v.trim() ? parseNlp(v) : null);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setShaking(true); setTimeout(() => setShaking(false), 220); return;
    }
    setSaving(true);
    const parsed = nlp ?? parseNlp(value);
    try {
      const task = await onAdd({
        title: parsed.cleanTitle || value.trim(),
        tags: parsed.tags,
        priority: parsed.priority === "high" ? 1 : parsed.priority === "medium" ? 2 : null,
        due_at: parsed.date,
        time_estimate_minutes: parsed.durationMinutes,
      });
      showToast({ message: `✓ ${task.title}`, duration: 2500 });
      if (parsed.unparsedTokens.length) {
        showToast({ message: `Didn't parse "${parsed.unparsedTokens[0]}" — saved without date`, duration: 4000, variant: "amber" });
      }
      setOpen(false);
    } catch {
      showToast({ message: "Saved offline — will sync", duration: 3000, variant: "amber" });
      setOpen(false);
    } finally { setSaving(false); }
  }, [value, nlp, onAdd, showToast]);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Quick capture" aria-describedby="qc-instructions"
      style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "20vh", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div style={{ width: "100%", maxWidth: 540, padding: "0 16px" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Main input */}
        <span id="qc-instructions" className="sr-only">Type a task and press Enter to save. Press Escape to close.</span>

        <form onSubmit={handleSubmit}
          style={{ background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--accent-blue)", overflow: "hidden", boxShadow: "0 24px 48px rgba(0,0,0,0.5)", animation: shaking ? "shake 220ms ease-out" : undefined }}>
          <input ref={inputRef} value={value} onChange={handleChange}
            placeholder='Add a task — "meeting @fri !#work ~30m"'
            autoComplete="off"
            style={{ width: "100%", padding: "16px 18px", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 16, outline: "none" }}
            aria-label="Quick capture task"
          />

          {/* NLP preview strip */}
          {nlp && (nlp.date || nlp.tags.length > 0 || nlp.priority || nlp.durationMinutes) && (
            <div style={{ padding: "0 18px 10px", display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: "var(--text-muted)" }}>
              {nlp.date && <span style={{ color: "var(--accent-blue)" }}>📅 {new Date(nlp.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>}
              {nlp.priority && <span style={{ color: nlp.priority === "high" ? "var(--accent-red)" : "var(--accent-amber)" }}>{nlp.priority === "high" ? "🔴 high" : "🟡 medium"}</span>}
              {nlp.durationMinutes && <span style={{ color: "var(--text-secondary)" }}>⏱ {nlp.durationMinutes >= 60 ? `${nlp.durationMinutes / 60}h` : `${nlp.durationMinutes}m`}</span>}
              {nlp.tags.map((t) => <span key={t} className="tag-chip">#{t}</span>)}
              {nlp.unparsedTokens.map((t) => <span key={t} className="nlp-token-unparsed">{t}</span>)}
            </div>
          )}

          {/* Footer shortcuts */}
          <div style={{ padding: "8px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              <kbd style={{ background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 3, marginRight: 4 }}>↩</kbd>save ·
              <kbd style={{ background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 3, margin: "0 4px" }}>Esc</kbd>close
            </span>
            <button type="submit" disabled={saving}
              style={{ padding: "5px 14px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 13, opacity: saving ? 0.7 : 1 }}>
              {saving ? "…" : "Save"}
            </button>
          </div>
        </form>

        <p style={{ marginTop: 10, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          <kbd style={{ background: "var(--bg-elevated)", padding: "1px 5px", borderRadius: 3 }}>⌘K</kbd> anywhere to capture
        </p>
      </div>
    </div>
  );
}
