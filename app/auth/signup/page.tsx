"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "magic" | "password";

export default function SignUpPage() {
  const supabase   = getSupabaseClient();
  const router     = useRouter();
  const [mode, setMode]         = useState<Mode>("magic");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) { setError("That doesn't look like a valid email"); setLoading(false); return; }
    try {
      if (mode === "magic") {
        const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } });
        if (err) throw err;
        setSent(true);
      } else {
        if (password.length < 8) { setError("Password must be at least 8 characters"); setLoading(false); return; }
        const { error: err } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } });
        if (err) throw err;
        setSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  if (sent) return (
    <main style={S.page}>
      <div style={S.card}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>📬</p>
        <h1 style={S.h1}>Check your inbox</h1>
        <p style={S.sub}>We sent a link to <strong>{email}</strong>.<br />{mode === "magic" ? "Click it to sign in." : "Click it to confirm your email, then sign in."}</p>
        <button onClick={() => setSent(false)} style={S.link}>Back · Resend</button>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <div style={S.card}>
        <Link href="/" style={{ color: "var(--accent-blue)", fontWeight: 700, fontSize: 20, textDecoration: "none", display: "block", marginBottom: 24 }}>✦ focus</Link>
        <h1 style={S.h1}>Create account</h1>

        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: 3 }}>
          {(["magic","password"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: "7px 0", borderRadius: "calc(var(--radius) - 1px)", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", background: mode === m ? "var(--bg-surface)" : "transparent", color: mode === m ? "var(--text-primary)" : "var(--text-muted)" }}>
              {m === "magic" ? "Magic link (recommended)" : "Password"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email address" required autoFocus
            style={{ ...S.input, borderColor: error ? "var(--accent-red)" : "var(--border)" }} aria-label="Email address"
          />
          {mode === "password" && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password (min 8 chars)" required
              style={S.input} aria-label="Password (minimum 8 characters)"
            />
          )}
          {error && <p style={{ color: "var(--accent-red)", fontSize: 13 }} role="alert">{error}</p>}
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "…" : mode === "magic" ? "Send magic link →" : "Create account →"}
          </button>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
          <button onClick={async () => { setLoading(true); await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } }); }}
            style={S.oauthBtn}>Continue with Google</button>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
          Already have an account? <Link href="/auth/login" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Sign in →</Link>
        </p>
        <p style={{ marginTop: 10, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>
          Free forever. No credit card.
        </p>
      </div>
    </main>
  );
}

const S = {
  page:     { minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "var(--bg-base)" } as React.CSSProperties,
  card:     { width: "100%", maxWidth: 400, background: "var(--bg-surface)", borderRadius: 10, padding: "32px 28px", border: "1px solid var(--border)" } as React.CSSProperties,
  h1:       { fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 } as React.CSSProperties,
  sub:      { color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 } as React.CSSProperties,
  input:    { width: "100%", padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: 15 } as React.CSSProperties,
  btn:      { width: "100%", padding: "12px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 } as React.CSSProperties,
  link:     { background: "none", border: "none", color: "var(--accent-blue)", fontSize: 13, cursor: "pointer", padding: 0 } as React.CSSProperties,
  oauthBtn: { width: "100%", padding: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer" } as React.CSSProperties,
};
