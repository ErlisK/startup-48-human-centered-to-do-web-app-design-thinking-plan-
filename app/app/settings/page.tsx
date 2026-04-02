"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Task } from "@/lib/supabase/types";

type ExportFormat = "csv" | "json";

export default function SettingsPage() {
  const router   = useRouter();
  const supabase = getSupabaseClient();
  const [deleted, setDeleted]           = useState<Task[]>([]);
  const [exporting, setExporting]       = useState(false);
  const [deleteStep, setDeleteStep]     = useState<"idle" | "confirm" | "deleting">("idle");
  const [deleteInput, setDeleteInput]   = useState("");
  const [deleteError, setDeleteError]   = useState("");
  const [taskCount, setTaskCount]       = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;
      // Recently deleted
      const { data: del } = await db.rpc("recently_deleted", { p_user_id: user.id });
      if (del) setDeleted(del);
      // Task count for delete confirmation
      const { count } = await db
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("deleted_at", null);
      setTaskCount(count ?? 0);
    }
    load();
  }, [supabase]);

  async function restore(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("tasks").update({ deleted_at: null }).eq("id", id);
    setDeleted((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleExport(format: ExportFormat) {
    setExporting(true);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error(await res.text());
      const blob      = await res.blob();
      const url        = URL.createObjectURL(blob);
      const a          = document.createElement("a");
      const now        = new Date().toISOString().split("T")[0];
      a.href           = url;
      a.download       = `focus-tasks-${now}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed: " + (e instanceof Error ? e.message : String(e)));
    } finally { setExporting(false); }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== "delete my account") {
      setDeleteError('Type "delete my account" to confirm');
      return;
    }
    setDeleteStep("deleting");
    try {
      const res  = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE_MY_ACCOUNT" }),
      });
      const data = await res.json();
      if (!res.ok) { setDeleteError(data.error); setDeleteStep("confirm"); return; }
      await supabase.auth.signOut();
      router.push("/?deleted=1");
    } catch {
      setDeleteError("Deletion failed — please try again");
      setDeleteStep("confirm");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const S = {
    section: { background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 16 } as React.CSSProperties,
    heading: { fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: 1, fontWeight: 600, padding: "12px 16px", borderBottom: "1px solid var(--border)" },
    row:     { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" } as React.CSSProperties,
    btn:     (variant: "primary" | "secondary" | "danger") => ({
      padding: "7px 14px", fontSize: 13, fontWeight: 600, border: "none", borderRadius: "var(--radius)", cursor: "pointer",
      ...(variant === "primary"   ? { background: "var(--accent-green)", color: "#0d1117" } : {}),
      ...(variant === "secondary" ? { background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" } : {}),
      ...(variant === "danger"    ? { background: "#2a0d0d", color: "var(--accent-red)", border: "1px solid var(--accent-red)" } : {}),
    } as React.CSSProperties),
  };

  return (
    <div style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Settings</h1>

      {/* ── Keyboard shortcuts ── */}
      <section aria-labelledby="kb-heading" style={S.section}>
        <h2 id="kb-heading" style={S.heading}>Keyboard shortcuts</h2>
        <div style={{ padding: "10px 16px" }}>
          {[
            ["⌘K / Ctrl+K", "Quick capture (anywhere)"],
            ["G T",          "Go to Today"],
            ["G I",          "Go to Inbox"],
            ["Space",        "Complete focused task"],
            ["⌫ / Del",     "Delete focused task (confirmation)"],
            ["↑ / ↓",        "Navigate tasks"],
            ["Home / End",   "Jump to first / last task"],
            ["Esc",          "Edit last-added task (3s window)"],
          ].map(([key, desc]) => (
            <div key={key} style={{ display: "flex", gap: 16, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
              <kbd style={{ minWidth: 110, fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-elevated)", padding: "2px 6px", borderRadius: 3, fontFamily: "monospace" }}>{key}</kbd>
              <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Data: Export ── */}
      <section aria-labelledby="export-heading" style={S.section}>
        <h2 id="export-heading" style={S.heading}>Export your data</h2>
        <div style={S.row}>
          <div>
            <p style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>Download all tasks</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              All tasks including completed and deleted (last 7 days)
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleExport("csv")} disabled={exporting}
              style={S.btn("secondary")} aria-label="Export as CSV">
              {exporting ? "…" : "CSV"}
            </button>
            <button onClick={() => handleExport("json")} disabled={exporting}
              style={S.btn("secondary")} aria-label="Export as JSON">
              {exporting ? "…" : "JSON"}
            </button>
          </div>
        </div>
        <div style={{ ...S.row, borderBottom: "none", justifyContent: "flex-start" }}>
          <Link href="/app/import"
            style={{ color: "var(--accent-blue)", fontSize: 13, textDecoration: "underline" }}>
            Import tasks from CSV →
          </Link>
        </div>
      </section>

      {/* ── Recently deleted ── */}
      {deleted.length > 0 && (
        <section aria-labelledby="deleted-heading" style={S.section}>
          <h2 id="deleted-heading" style={S.heading}>Recently deleted (last 7 days)</h2>
          {deleted.map((task) => (
            <div key={task.id} style={S.row}>
              <div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>{task.title}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {task.deleted_at ? new Date(task.deleted_at).toLocaleDateString() : ""}
                </p>
              </div>
              <button onClick={() => restore(task.id)} style={S.btn("primary")}
                aria-label={`Restore "${task.title}"`}>
                Restore
              </button>
            </div>
          ))}
          <p style={{ padding: "8px 16px", fontSize: 11, color: "var(--text-muted)" }}>
            Tasks are permanently deleted after 7 days.
          </p>
        </section>
      )}

      {/* ── Telemetry / Privacy ── */}
      <section aria-labelledby="privacy-heading" style={S.section}>
        <h2 id="privacy-heading" style={S.heading}>Privacy</h2>
        <div style={S.row}>
          <div>
            <p style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>Telemetry</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Off by default. We never load tracking SDKs without your consent.
            </p>
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "3px 10px", borderRadius: 10 }}>
            Off
          </span>
        </div>
        <div style={{ ...S.row, borderBottom: "none" }}>
          <Link href="/privacy"
            style={{ color: "var(--accent-blue)", fontSize: 13, textDecoration: "underline" }}>
            Privacy policy →
          </Link>
        </div>
      </section>

      {/* ── Danger zone: delete account ── */}
      <section aria-labelledby="danger-heading" style={{ ...S.section, border: "1px solid #3a1a1a" }}>
        <h2 id="danger-heading" style={{ ...S.heading, borderBottom: "1px solid #3a1a1a", color: "var(--accent-red)" }}>
          Danger zone
        </h2>

        {deleteStep === "idle" && (
          <div style={S.row}>
            <div>
              <p style={{ fontSize: 14, color: "var(--text-primary)", marginBottom: 2 }}>Delete account</p>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Permanently deletes all tasks and your account. Irreversible.
                {taskCount !== null ? ` (${taskCount} active task${taskCount !== 1 ? "s" : ""})` : ""}
              </p>
            </div>
            <button onClick={() => setDeleteStep("confirm")} style={S.btn("danger")}
              aria-label="Begin account deletion">
              Delete account
            </button>
          </div>
        )}

        {deleteStep === "confirm" && (
          <div style={{ padding: "16px" }}>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 12 }}>
              This will permanently delete{" "}
              <strong style={{ color: "var(--accent-red)" }}>all {taskCount ?? "your"} tasks</strong>{" "}
              and your account. There is no undo.
            </p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
              Type <strong style={{ color: "var(--text-primary)" }}>delete my account</strong> to confirm:
            </p>
            <input
              type="text"
              value={deleteInput}
              onChange={(e) => { setDeleteInput(e.target.value); setDeleteError(""); }}
              placeholder="delete my account"
              autoFocus
              aria-label='Type "delete my account" to confirm account deletion'
              style={{ width: "100%", padding: "9px 12px", background: "var(--bg-elevated)", border: "1px solid var(--accent-red)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: 14, marginBottom: 8 }}
              onKeyDown={(e) => { if (e.key === "Enter") handleDeleteAccount(); if (e.key === "Escape") setDeleteStep("idle"); }}
            />
            {deleteError && (
              <p role="alert" style={{ color: "var(--accent-red)", fontSize: 12, marginBottom: 8 }}>{deleteError}</p>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleDeleteAccount}
                disabled={deleteInput !== "delete my account"}
                style={{ ...S.btn("danger"), opacity: deleteInput !== "delete my account" ? 0.5 : 1 }}
                aria-label="Confirm account deletion">
                Delete everything
              </button>
              <button onClick={() => { setDeleteStep("idle"); setDeleteInput(""); setDeleteError(""); }}
                style={S.btn("secondary")} aria-label="Cancel account deletion">
                Cancel
              </button>
            </div>
          </div>
        )}

        {deleteStep === "deleting" && (
          <div style={{ padding: 16, color: "var(--text-muted)", fontSize: 13 }}>
            Deleting your account…
          </div>
        )}
      </section>

      {/* ── Sign out ── */}
      <div style={{ marginTop: 8 }}>
        <button onClick={signOut}
          style={S.btn("secondary")}
          aria-label="Sign out of focus">
          Sign out
        </button>
      </div>
    </div>
  );
}
