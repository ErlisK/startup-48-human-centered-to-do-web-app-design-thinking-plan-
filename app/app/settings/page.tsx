"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Task } from "@/lib/supabase/types";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [deleted, setDeleted] = useState<Task[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.rpc("recently_deleted", { p_user_id: user.id });
      if (data) setDeleted(data);
    }
    load();
  }, [supabase]);

  async function restore(id: string) {
    await supabase.from("tasks").update({ deleted_at: null }).eq("id", id);
    setDeleted((prev) => prev.filter((t) => t.id !== id));
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      {deleted.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Recently deleted (last 7 days)</h2>
          <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {deleted.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ flex: 1, color: "var(--text-secondary)", fontSize: 14 }}>{task.title}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginRight: 12 }}>
                  {new Date(task.deleted_at!).toLocaleDateString()}
                </span>
                <button onClick={() => restore(task.id)}
                  style={{ fontSize: 13, color: "var(--accent-green)", background: "none", border: "none", cursor: "pointer" }}>
                  Restore
                </button>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>Tasks are permanently deleted after 7 days.</p>
        </section>
      )}

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Keyboard shortcuts</h2>
        <div style={{ background: "var(--bg-surface)", borderRadius: "var(--radius)", padding: 14, fontSize: 13, color: "var(--text-secondary)", lineHeight: 2 }}>
          <div><kbd style={{ background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 3 }}>G T</kbd> — Go to Today</div>
          <div><kbd style={{ background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 3 }}>G I</kbd> — Go to Inbox</div>
          <div><kbd style={{ background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 3 }}>Space</kbd> — Complete focused task</div>
          <div><kbd style={{ background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 3 }}>⌫</kbd> — Delete focused task (with confirmation)</div>
          <div><kbd style={{ background: "var(--bg-elevated)", padding: "1px 6px", borderRadius: 3 }}>Esc</kbd> — Edit last added task (3s window)</div>
        </div>
      </section>

      <button onClick={signOut}
        style={{ padding: "10px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14 }}>
        Sign out
      </button>
    </div>
  );
}
