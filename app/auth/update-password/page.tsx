"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function UpdatePasswordPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); return; }
    setDone(true);
    setTimeout(() => router.push("/app/today"), 1500);
  }

  if (done) return <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)" }}><p style={{ color: "var(--accent-green)", fontSize: 18, fontWeight: 700 }}>Password updated ✓</p></main>;

  return (
    <main style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg-base)" }}>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--bg-surface)", borderRadius: 10, padding: "32px 24px", border: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Set new password</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="new password (min 8 chars)" required autoFocus
            style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: 15 }}
          />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="confirm password" required
            style={{ padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: 15 }}
          />
          {error && <p style={{ color: "var(--accent-red)", fontSize: 13 }} role="alert">{error}</p>}
          <button type="submit" style={{ padding: "12px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 }}>
            Update password
          </button>
        </form>
      </div>
    </main>
  );
}
