import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Install — focus",
  description: "Install focus as a PWA on any device. No app store needed.",
};

const PLATFORMS = [
  {
    id: "ios",
    name: "iPhone / iPad",
    icon: "🍎",
    badge: "iOS 16.4+",
    steps: [
      { n: "1", text: "Open Safari (must be Safari — not Chrome/Firefox on iOS)" },
      { n: "2", text: "Visit startup-48-human-centered-to-do-web.vercel.app" },
      { n: "3", text: "Tap the Share button (□↑) at the bottom of the screen" },
      { n: "4", text: "Scroll down and tap \"Add to Home Screen\"" },
      { n: "5", text: "Tap \"Add\" in the top right corner" },
    ],
    note: "The app icon will appear on your home screen. It opens full-screen with no browser chrome.",
  },
  {
    id: "android",
    name: "Android",
    icon: "🤖",
    badge: "Chrome / Samsung Internet",
    steps: [
      { n: "1", text: "Open Chrome (or Samsung Internet)" },
      { n: "2", text: "Visit startup-48-human-centered-to-do-web.vercel.app" },
      { n: "3", text: "Tap the ⋮ menu (three dots) in the top-right corner" },
      { n: "4", text: "Tap \"Add to Home screen\" or \"Install app\"" },
      { n: "5", text: "Tap \"Install\" on the confirmation prompt" },
    ],
    note: "Chrome may show an install banner automatically after a few visits. Tap it to install.",
  },
  {
    id: "desktop-chrome",
    name: "Chrome / Edge (Desktop)",
    icon: "🖥️",
    badge: "Windows · macOS · Linux",
    steps: [
      { n: "1", text: "Open Chrome or Microsoft Edge" },
      { n: "2", text: "Visit startup-48-human-centered-to-do-web.vercel.app" },
      { n: "3", text: "Look for the install icon (⊕) in the address bar right side" },
      { n: "4", text: "Click it and choose \"Install\"" },
    ],
    note: "The app opens in its own window, separate from your browser tabs. Use ⌘K / Ctrl+K for quick capture.",
  },
  {
    id: "desktop-safari",
    name: "Safari (macOS)",
    icon: "🧭",
    badge: "macOS Sonoma+",
    steps: [
      { n: "1", text: "Open Safari on macOS Sonoma (14) or later" },
      { n: "2", text: "Visit startup-48-human-centered-to-do-web.vercel.app" },
      { n: "3", text: "In the menu bar: File → Add to Dock" },
    ],
    note: "On older macOS: use Safari's Share button → \"Add to Dock\".",
  },
];

const KEY_SHORTCUTS = [
  { key: "⌘K", desc: "Quick capture from anywhere" },
  { key: "Enter", desc: "Save task" },
  { key: "Space", desc: "Complete focused task" },
  { key: "↑ ↓", desc: "Navigate between tasks" },
  { key: "⌫", desc: "Delete selected task (confirm)" },
  { key: "Esc", desc: "Close modal / cancel" },
  { key: "G T", desc: "Go to Today view" },
  { key: "G I", desc: "Go to Inbox" },
];

export default function InstallPage() {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Nav */}
      <nav style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--accent-blue)", fontWeight: 900, fontSize: 20, textDecoration: "none", letterSpacing: -0.5 }}>
          ✦ focus
        </Link>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/privacy" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>Privacy</Link>
          <Link href="/auth/signup" style={{ background: "var(--accent-green)", color: "#0d1117", padding: "7px 16px", borderRadius: "var(--radius)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            Get started
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">📲</div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 900, marginBottom: 12, letterSpacing: -0.5 }}>
            Install focus on any device
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            No app store. No account required to browse. Works offline once installed.
            One tap to add to your home screen.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {["No download", "Works offline", "~200KB total", "No tracking"].map((tag) => (
              <span key={tag} style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 12, padding: "3px 10px", fontSize: 12, color: "var(--text-muted)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Platform cards */}
        <section aria-labelledby="platform-heading">
          <h2 id="platform-heading" style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "var(--text-secondary)", textAlign: "center" }}>
            Pick your platform
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16, marginBottom: 48 }}>
            {PLATFORMS.map((p) => (
              <article key={p.id}
                id={p.id}
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "24px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 28 }} aria-hidden="true">{p.icon}</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{p.name}</h3>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 8, border: "1px solid var(--border)" }}>
                      {p.badge}
                    </span>
                  </div>
                </div>
                <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {p.steps.map((s) => (
                    <li key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{
                        width: 22, height: 22, background: "var(--accent-blue)", color: "#0d1117",
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 11, flexShrink: 0, marginTop: 1,
                      }}>{s.n}</span>
                      <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{s.text}</span>
                    </li>
                  ))}
                </ol>
                {p.note && (
                  <p style={{ marginTop: 14, fontSize: 12, color: "var(--text-muted)", padding: "8px 12px", background: "var(--bg-base)", borderRadius: 6, border: "1px solid var(--border)", lineHeight: 1.5 }}>
                    💡 {p.note}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section aria-labelledby="shortcuts-heading" style={{ marginBottom: 48 }}>
          <h2 id="shortcuts-heading" style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: "center", color: "var(--text-secondary)" }}>
            Keyboard shortcuts
          </h2>
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {KEY_SHORTCUTS.map((ks, i) => (
              <div key={ks.key} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "12px 20px",
                borderBottom: i < KEY_SHORTCUTS.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                <kbd style={{
                  fontFamily: "ui-monospace, Menlo, monospace",
                  fontSize: 12, fontWeight: 600,
                  background: "var(--bg-elevated)", color: "var(--accent-blue)",
                  border: "1px solid var(--border)", borderRadius: 4,
                  padding: "3px 8px", minWidth: 52, textAlign: "center",
                  flexShrink: 0,
                }}>{ks.key}</kbd>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{ks.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy callout */}
        <section aria-labelledby="privacy-callout" style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "24px", marginBottom: 48,
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 32, flexShrink: 0 }} aria-hidden="true">🔒</span>
          <div>
            <h2 id="privacy-callout" style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>Privacy first, always</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
              focus loads <strong>no third-party scripts</strong> — no Google Analytics, no Facebook Pixel,
              no Hotjar, no tracking of any kind. The only network connection the app makes is to
              Supabase (your database) to save your tasks. Your data never leaves without your consent.
              Export everything as CSV anytime. Delete your account in one tap.{" "}
              <Link href="/privacy" style={{ color: "var(--accent-blue)" }}>Read the full privacy policy →</Link>
            </p>
          </div>
        </section>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Link href="/auth/signup" style={{
            background: "var(--accent-green)", color: "#0d1117",
            padding: "14px 36px", borderRadius: "var(--radius)",
            fontWeight: 800, fontSize: 16, textDecoration: "none",
            display: "inline-block", marginBottom: 12,
          }}>
            Create free account →
          </Link>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            Free forever · Open source ·{" "}
            <Link href="https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-"
              target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--text-muted)", textDecoration: "underline" }}>
              View source on GitHub ↗
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>✦ focus — v0.1.2</span>
          <div style={{ display: "flex", gap: 16 }}>
            <Link href="/" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>Home</Link>
            <Link href="/privacy" style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>Privacy</Link>
            <Link href="https://github.com/ErlisK/startup-48-human-centered-to-do-web-app-design-thinking-plan-"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}>GitHub ↗</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
