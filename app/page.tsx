import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center max-w-md mx-auto">
      <h1 className="text-5xl mb-6" style={{ color: "var(--accent-blue)" }}>✦ focus</h1>
      <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
        Your tasks, without the guilt or the overwhelm.
      </h2>
      <ul className="text-base mb-10 space-y-2" style={{ color: "var(--text-secondary)" }}>
        <li>Capture in 3 seconds.</li>
        <li>See only what matters today.</li>
        <li>Celebrate what you finish.</li>
      </ul>

      <form action="/auth/signup" method="GET" className="w-full space-y-3">
        <input
          type="email" name="email" placeholder="your@email.com" required
          className="w-full px-4 py-3 rounded-lg text-base"
          style={{ background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
        <Link
          href="/auth/signup"
          className="block w-full py-3 rounded-lg font-bold text-center transition-opacity hover:opacity-90"
          style={{ background: "var(--accent-green)", color: "#0d1117" }}
        >
          Get early access →
        </Link>
      </form>
      <p className="mt-4 text-xs" style={{ color: "var(--text-muted)" }}>
        Free. No credit card. Reminders always included.
      </p>
      <p className="mt-2 text-xs" style={{ color: "var(--accent-blue)" }}>
        <Link href="/auth/login">Already have an account? Sign in</Link>
      </p>
    </main>
  );
}
