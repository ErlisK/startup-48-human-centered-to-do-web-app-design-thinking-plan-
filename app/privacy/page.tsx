import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy — focus",
  description: "How focus handles your data",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>{title}</h2>
    <div style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.75 }}>{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      <nav style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--accent-blue)", fontWeight: 800, fontSize: 18, textDecoration: "none" }}>
          ✦ focus
        </Link>
        <Link href="/app/today" style={{ color: "var(--text-muted)", fontSize: 13, textDecoration: "none" }}>
          ← Back to app
        </Link>
      </nav>
      <main id="main-content" style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
          Privacy &amp; Data
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 40 }}>
          Last updated: April 2026
        </p>

        <Section title="What we store">
          <p>Your account email and the tasks you create. That&apos;s it. No profile data, no device fingerprints.</p>
        </Section>

        <Section title="Tracking &amp; telemetry">
          <p id="telemetry">
            <strong style={{ color: "var(--text-primary)" }}>Telemetry is off by default.</strong>{" "}
            We never load Google Analytics, Mixpanel, Sentry, or any third-party tracking SDK.
            No cookies are set by us. No cross-site tracking.
          </p>
          <p style={{ marginTop: 8 }}>
            You can opt in to anonymous usage statistics from{" "}
            <strong>Settings → Privacy → Share anonymous usage statistics</strong>.
            Opting in is entirely voluntary and can be reversed at any time.
          </p>
          <p style={{ marginTop: 8, fontWeight: 600, color: "var(--text-primary)" }}>
            When you opt in, we collect:
          </p>
          <ul style={{ marginTop: 4, paddingLeft: 20, lineHeight: 1.8 }}>
            <li><strong>Event name</strong> — one of: signup_completed, first_task_created, task_completed</li>
            <li><strong>Anonymous ID</strong> — an 8-character hex code generated randomly in your browser.
              It cannot be reversed to your identity and rotates if you clear browser storage.</li>
            <li><strong>Session ID</strong> — a random UUID that resets when you close the tab</li>
            <li><strong>App version</strong> — e.g. &quot;0.1.2&quot;</li>
            <li><strong>Browser family</strong> — one of: chrome, firefox, safari, edge, other</li>
          </ul>
          <p style={{ marginTop: 8, fontWeight: 600, color: "var(--text-primary)" }}>
            We never collect:
          </p>
          <ul style={{ marginTop: 4, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Your email address or any personally identifiable information</li>
            <li>Task titles or any task content</li>
            <li>Your IP address</li>
            <li>Your full user agent string</li>
            <li>Any data from third-party sources</li>
          </ul>
          <p style={{ marginTop: 8 }}>
            Telemetry data is stored in our own Supabase database, automatically deleted after 90 days,
            and never shared with third parties.
          </p>
        </Section>

        <Section title="Data storage">
          <p>
            Tasks are stored in PostgreSQL on Supabase (AWS us-east-1).
            Row-level security ensures only you can read or write your own tasks.
            Auth tokens are stored in cookies (HttpOnly, Secure, SameSite=Lax).
          </p>
        </Section>

        <Section title="Export your data">
          <p>
            You can download all your tasks at any time from{" "}
            <Link href="/app/settings" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>
              Settings → Export
            </Link>
            . Data is exported as CSV or JSON with all fields intact.
          </p>
        </Section>

        <Section title="Delete your data">
          <p>
            You can delete all tasks and your account permanently from{" "}
            <Link href="/app/settings" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>
              Settings → Delete account
            </Link>
            . Deletion is immediate and irreversible — all task data is hard-deleted from our database.
          </p>
        </Section>

        <Section title="Third-party services">
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            <li><strong>Supabase</strong> — database + auth (AWS us-east-1). <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Their privacy policy →</a></li>
            <li><strong>Vercel</strong> — hosting. Standard access logs (IP, user-agent) are retained per Vercel&apos;s policy. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "underline" }}>Their privacy policy →</a></li>
          </ul>
        </Section>

        <Section title="Contact">
          <p>Questions? Reach us at <strong>privacy@focus.app</strong> (placeholder).</p>
        </Section>
      </main>
    </div>
  );
}
