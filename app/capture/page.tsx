"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { parseNlp } from "@/lib/nlp/parse";
import { ulid } from "@/lib/offline/ulid";

function CaptureContent() {
  const params = useSearchParams();
  const url    = params.get("url") ?? "";
  const title  = params.get("title") ?? "";
  const supabase = getSupabaseClient();

  const [value, setValue] = useState(title);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Sign in first — opening focus…"); setTimeout(() => window.location.href = "/auth/login", 1500); return; }
    const parsed = parseNlp(value);
    const task = {
      id: ulid(), user_id: user.id,
      title: parsed.cleanTitle || value.trim(),
      tags: parsed.tags, priority: parsed.priority === "high" ? 1 : null,
      due_at: parsed.date, completed_at: null, deleted_at: null,
      time_estimate_minutes: parsed.durationMinutes,
      created_at: new Date().toISOString(),
    };
    if (url) task.tags = [...new Set([...task.tags, "saved"])];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: err } = await (supabase as any).from("tasks").insert(task);
    if (err) { setError(err.message); return; }
    setSaved(true);
    setTimeout(() => window.close(), 800);
  }

  useEffect(() => {
    // Auto-focus on open
    document.querySelector("input")?.focus();
  }, []);

  if (saved) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-base)", gap: 12 }}>
      <span style={{ fontSize: 32 }}>✓</span>
      <p style={{ color: "var(--accent-green)", fontSize: 18, fontWeight: 700 }}>Saved!</p>
    </div>
  );

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)", padding: 16 }}>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>✦ focus — quick capture</p>
      {url && <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📎 {decodeURIComponent(url)}</p>}
      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <input value={value} onChange={(e) => setValue(e.target.value)}
          placeholder="Task name…" autoFocus
          style={{ padding: "10px 12px", background: "var(--bg-elevated)", border: "1px solid var(--accent-blue)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: 15 }}
        />
        {error && <p style={{ color: "var(--accent-red)", fontSize: 12 }}>{error}</p>}
        <button type="submit"
          style={{ padding: "12px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 }}>
          Save task →
        </button>
        <button type="button" onClick={() => window.close()}
          style={{ padding: "8px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default function CapturePage() {
  return <Suspense><CaptureContent /></Suspense>;
}
