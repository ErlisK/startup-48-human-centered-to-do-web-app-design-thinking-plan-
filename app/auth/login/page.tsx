"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "magic" | "password";
type Step = "form" | "magic-sent" | "reset-sent";

export default function LoginPage() {
  const supabase = getSupabaseClient();
  const router = useRouter();
  const [mode, setMode]         = useState<Mode>("magic");
  const [step, setStep]         = useState<Step>("form");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (mode === "magic") {
        const { error: err } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
        });
        if (err) throw err;
        setStep("magic-sent");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push("/app/today");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) { setError("Enter your email first"); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/auth/update-password`,
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStep("reset-sent");
  }

  if (step === "magic-sent") return (
    <main style={S.page}>
      <div style={S.card}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>📬</p>
        <h1 style={S.h1}>Check your inbox</h1>
        <p style={S.sub}>We sent a link to <strong>{email}</strong>.<br />Click it to sign in — no password needed.</p>
        <button onClick={() => setStep("form")} style={S.link}>Back · Resend · Check spam</button>
      </div>
    </main>
  );

  if (step === "reset-sent") return (
    <main style={S.page}>
      <div style={S.card}>
        <p style={{ fontSize: 32, marginBottom: 12 }}>🔑</p>
        <h1 style={S.h1}>Reset email sent</h1>
        <p style={S.sub}>Check <strong>{email}</strong> for a password reset link.</p>
        <button onClick={() => setStep("form")} style={S.link}>Back to sign in</button>
      </div>
    </main>
  );

  return (
    <main style={S.page}>
      <div style={S.card}>
        <Link href="/" style={{ color: "var(--accent-blue)", fontWeight: 700, fontSize: 20, textDecoration: "none", display: "block", marginBottom: 24 }}>✦ focus</Link>
        <h1 style={S.h1}>Sign in</h1>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "var(--bg-elevated)", borderRadius: "var(--radius)", padding: 3 }}>
          {(["magic","password"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: "7px 0", borderRadius: "calc(var(--radius) - 1px)", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", background: mode === m ? "var(--bg-surface)" : "transparent", color: mode === m ? "var(--text-primary)" : "var(--text-muted)", transition: "background 120ms" }}>
              {m === "magic" ? "Magic link" : "Password"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email address" required autoComplete="email" autoFocus
            style={error && !password ? { ...S.input, borderColor: "var(--accent-red)" } : S.input}
            aria-label="Email address"
          />
          {mode === "password" && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="password" required autoComplete="current-password"
              style={error && password ? { ...S.input, borderColor: "var(--accent-red)" } : S.input}
              aria-label="Password"
            />
          )}
          {error && <p style={{ color: "var(--accent-red)", fontSize: 13 }} role="alert">{error}</p>}
          <button type="submit" disabled={loading}
            style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} aria-label="Sign in">
            {loading ? "…" : mode === "magic" ? "Send magic link →" : "Sign in →"}
          </button>
        </form>

        {mode === "password" && (
          <button onClick={handleResetPassword} style={{ ...S.link, marginTop: 8 }}>
            Forgot password?
          </button>
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={async () => {
              setLoading(true);
              await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` } });
            }}
            style={S.oauthBtn} aria-label="Continue with Google">
            Continue with Google
          </button>
        </div>

        <p style={{ marginTop: 20, fontSize: 13, color: "var(--text-muted)", textAlign: "center" }}>
          No account? <Link href="/auth/signup" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Create one →</Link>
        </p>
      </div>
    </main>
  );
}

const S = {
  page: { minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "var(--bg-base)" } as React.CSSProperties,
  card: { width: "100%", maxWidth: 400, background: "var(--bg-surface)", borderRadius: 10, padding: "32px 28px", border: "1px solid var(--border)" } as React.CSSProperties,
  h1: { fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 } as React.CSSProperties,
  sub: { color: "var(--text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.6 } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-primary)", fontSize: 15, outline: "none" } as React.CSSProperties,
  btn: { width: "100%", padding: "12px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 15 } as React.CSSProperties,
  link: { background: "none", border: "none", color: "var(--accent-blue)", fontSize: 13, cursor: "pointer", padding: 0 } as React.CSSProperties,
  oauthBtn: { width: "100%", padding: "10px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer" } as React.CSSProperties,
};
