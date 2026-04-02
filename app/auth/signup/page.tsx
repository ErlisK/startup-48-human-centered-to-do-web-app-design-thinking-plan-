"use client";
import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = getSupabaseClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) { setError("That doesn't look like a valid email"); return; }
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` },
    });
    if (err) { setError(err.message); return; }
    setSent(true);
  }

  if (sent) return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Check your inbox</h1>
      <p className="mb-2" style={{ color: "var(--text-secondary)" }}>
        We sent a link to <strong>{email}</strong>.
      </p>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Open your email app and click the link inside. It signs you straight in — no password needed.
      </p>
      <button onClick={() => setSent(false)} className="text-sm" style={{ color: "var(--accent-blue)" }}>
        Resend · Check spam
      </button>
    </main>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Create your account</h1>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email address" required
            className="w-full px-4 py-3 rounded-lg text-base"
            style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: `1px solid ${error ? "var(--accent-red)" : "var(--border)"}` }}
          />
          {error && <p className="text-sm mt-1" style={{ color: "var(--accent-red)" }}>{error}</p>}
        </div>
        <button type="submit" className="w-full py-3 rounded-lg font-bold transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-green)", color: "#0d1117" }}>
          Send magic link →
        </button>
        <button type="button" className="w-full py-3 rounded-lg border text-sm"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--bg-elevated)" }}
          onClick={async () => {
            await getSupabaseClient().auth.signInWithOAuth({
              provider: "google",
              options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback` }
            });
          }}>
          Continue with Google
        </button>
      </form>
      <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        By signing up you agree to the <Link href="/terms" style={{ color: "var(--accent-blue)" }}>Terms</Link> and{" "}
        <Link href="/privacy" style={{ color: "var(--accent-blue)" }}>Privacy Policy</Link>.
      </p>
    </main>
  );
}
