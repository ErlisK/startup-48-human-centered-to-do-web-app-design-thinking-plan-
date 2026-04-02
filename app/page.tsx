import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "focus — tasks that don't pile up",
  description: "A calm, keyboard-first to-do app. Capture anything instantly. Focus on 3 tasks a day. Watch your Done Wall grow.",
  openGraph: {
    title: "focus — tasks that don't pile up",
    description: "Keyboard-first capture. Limit yourself to 3 tasks a day. No streak pressure, ever.",
    type: "website",
  },
};

const features = [
  { icon: "⚡", title: "Instant capture", body: "Press ⌘K anywhere in the app. Or drag the bookmarklet to save from any page. NLP parses dates, tags, and priority as you type." },
  { icon: "3️⃣", title: "Today's pick-3", body: "Every morning, we surface your top 3 tasks. Swap any of them before you start. Queue the rest — no pressure." },
  { icon: "🧱", title: "Done Wall", body: "Completed tasks become coloured tiles that build up all day. Visual proof that you shipped things — no streaks, no shame." },
  { icon: "🌙", title: "Wind-down ritual", body: "At day's end, quickly decide which unfinished tasks to keep or reschedule. Tomorrow starts clean." },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* Nav */}
      <nav style={{ maxWidth: 860, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: "var(--accent-blue)" }}>✦ focus</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/auth/login" style={{ color: "var(--text-muted)", fontSize: 14, textDecoration: "none" }}>Sign in</Link>
          <Link href="/auth/signup"
            style={{ padding: "8px 18px", background: "var(--accent-green)", color: "#0d1117", borderRadius: 6, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 80px", textAlign: "center" }}>
          <div style={{ display: "inline-block", padding: "4px 14px", background: "#0d2a0d", border: "1px solid #2ecc7133", borderRadius: 20, fontSize: 12, color: "var(--accent-green)", marginBottom: 24 }}>
            Free forever · No credit card
          </div>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: "-1px" }}>
            Tasks that don&apos;t<br />pile up.
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.65 }}>
            A calm, keyboard-first to-do app. Capture anything in under 2 seconds.
            Focus on 3 tasks a day. Watch your Done Wall grow.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup"
              style={{ padding: "14px 32px", background: "var(--accent-green)", color: "#0d1117", borderRadius: 8, fontSize: 16, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>
              Start for free →
            </Link>
            <Link href="/auth/login"
              style={{ padding: "14px 24px", background: "var(--bg-elevated)", color: "var(--text-secondary)", borderRadius: 8, fontSize: 16, fontWeight: 600, textDecoration: "none", display: "inline-block", border: "1px solid var(--border)" }}>
              Sign in
            </Link>
          </div>
        </section>

        {/* Feature cards */}
        <section aria-label="Features" style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {features.map((f) => (
              <div key={f.title}
                style={{ background: "var(--bg-surface)", borderRadius: 10, padding: "22px 20px", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }} aria-hidden="true">{f.icon}</div>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>{f.title}</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA strip */}
        <section style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 100px", textAlign: "center" }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10 }}>Ship your first task today.</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24, fontSize: 15 }}>
            Takes 30 seconds to sign up. Works offline. Installs as an app.
          </p>
          <Link href="/auth/signup"
            style={{ padding: "14px 36px", background: "var(--accent-green)", color: "#0d1117", borderRadius: 8, fontSize: 16, fontWeight: 800, textDecoration: "none", display: "inline-block" }}>
            Get started free
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>✦ focus</span>
        <Link href="/auth/login"   style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>Sign in</Link>
        <Link href="/bookmarklet"  style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>Bookmarklet</Link>
        <Link href="/auth/signup"  style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>Sign up</Link>
      </footer>
    </div>
  );
}
