import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "focus — the keyboard-first todo app",
  description: "Capture tasks in under 2 seconds. Your top 3 today, done. Free forever, open source.",
  keywords: ["todo app", "task manager", "productivity", "keyboard-first", "PWA", "offline"],
  openGraph: {
    title: "focus — the keyboard-first todo app",
    description: "Capture tasks in under 2 seconds. Your top 3 today, done.",
    type: "website",
    url: "https://startup-48-human-centered-to-do-web.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "focus — keyboard-first todo app",
    description: "Capture tasks in under 2 seconds. Free forever.",
  },
};

const FEATURES = [
  { icon: "⚡", title: "2-second capture",     desc: "Type naturally: \"Call dentist tomorrow 3pm\" and we parse it." },
  { icon: "🎯", title: "Top 3 focus",           desc: "Morning deal picks your best 3. Everything else waits." },
  { icon: "⌨️",  title: "Keyboard-first",        desc: "⌘K from anywhere. Space to complete. Arrow keys to navigate." },
  { icon: "📶", title: "Offline-ready",          desc: "PWA with service worker. Works on the train, in the air." },
  { icon: "🔒", title: "Private by default",     desc: "Your data stays yours. No tracking. No ads. Export anytime." },
  { icon: "🆓", title: "Free forever",           desc: "No freemium trap. Open source on GitHub." },
];

const STEPS = [
  { step: "1", text: "Sign up (email link, no password needed)" },
  { step: "2", text: "Type your first task and hit Enter" },
  { step: "3", text: "Let us pick your top 3 for today" },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Skip nav */}
      <a href="#main-content" className="skip-nav">Skip to content</a>

      {/* Header */}
      <header role="banner" style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 900, margin: "0 auto" }}>
        <span style={{ fontWeight: 900, fontSize: 20, color: "var(--accent-blue)", letterSpacing: -0.5 }}>✦ focus</span>
        <nav role="navigation" aria-label="Site navigation" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link href="/privacy" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>Privacy</Link>
          <Link href="https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
            GitHub ↗
          </Link>
          <Link href="/auth/login"
            style={{ background: "var(--accent-blue)", color: "#0d1117", padding: "8px 18px", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Sign in
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main id="main-content" tabIndex={-1} style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <section aria-labelledby="hero-heading" style={{ padding: "80px 0 60px", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "var(--text-muted)", marginBottom: 20, letterSpacing: 0.5 }}>
            v0.1.2 — Free &amp; open source
          </div>
          <h1 id="hero-heading" style={{ fontSize: "clamp(32px, 6vw, 60px)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
            The todo app that<br />
            <span style={{ color: "var(--accent-blue)" }}>gets out of your way</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.5vw, 19px)", color: "var(--text-secondary)", maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.6 }}>
            Capture tasks in under 2 seconds. Your morning picks your top&nbsp;3.
            Everything else stays out of sight until you need it.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/signup"
              style={{ background: "var(--accent-green)", color: "#0d1117", padding: "14px 28px", borderRadius: "var(--radius)", fontWeight: 800, fontSize: 16, textDecoration: "none", display: "inline-block" }}>
              Start for free →
            </Link>
            <Link href="/auth/login"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", padding: "14px 28px", borderRadius: "var(--radius)", fontWeight: 600, fontSize: 16, textDecoration: "none", border: "1px solid var(--border)", display: "inline-block" }}>
              Sign in
            </Link>
          </div>
          <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-muted)" }}>
            No credit card. No download. Works in your browser + installable PWA.
          </p>
        </section>

        {/* Features grid */}
        <section aria-labelledby="features-heading" style={{ paddingBottom: 60 }}>
          <h2 id="features-heading" style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 32, color: "var(--text-secondary)" }}>
            Built for how you actually work
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {FEATURES.map((f) => (
              <article key={f.title} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "20px 18px" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }} aria-hidden="true">{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: "var(--text-primary)" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section aria-labelledby="how-heading" style={{ paddingBottom: 60, textAlign: "center" }}>
          <h2 id="how-heading" style={{ fontSize: 22, fontWeight: 700, marginBottom: 28, color: "var(--text-secondary)" }}>
            Up and running in 60 seconds
          </h2>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {STEPS.map((s) => (
              <div key={s.step} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", maxWidth: 260 }}>
                <span style={{ width: 28, height: 28, background: "var(--accent-blue)", color: "#0d1117", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{s.step}</span>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", textAlign: "left" }}>{s.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta-heading" style={{ paddingBottom: 80, textAlign: "center" }}>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "40px 24px", maxWidth: 440, margin: "0 auto" }}>
            <h2 id="cta-heading" style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Ready to focus?</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Join the waitlist. Free forever. No spam.
            </p>
            <Link href="/auth/signup"
              style={{ background: "var(--accent-green)", color: "#0d1117", padding: "14px 32px", borderRadius: "var(--radius)", fontWeight: 800, fontSize: 16, textDecoration: "none", display: "inline-block", width: "100%", boxSizing: "border-box" as const }}>
              Create free account →
            </Link>
            <p style={{ marginTop: 12, fontSize: 12, color: "var(--text-muted)" }}>
              Open source ·{" "}
              <Link href="/privacy" style={{ color: "var(--text-muted)", textDecoration: "underline" }}>Privacy-first</Link>
              {" "}· No tracking
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer role="contentinfo" style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>✦ focus — v0.1.2</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/privacy"    style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>Privacy</Link>
            <Link href="https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>GitHub ↗</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
