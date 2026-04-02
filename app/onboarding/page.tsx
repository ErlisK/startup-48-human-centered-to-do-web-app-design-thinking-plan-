"use client";
import { useState } from "react";
import { trackEvent } from "@/lib/privacy/telemetry";
import { useRouter } from "next/navigation";

const OPTIONS = [
  { id: "overwhelm", emoji: "😩", label: "Everything feels overwhelming", ack: "We'll start by making your list feel calmer." },
  { id: "capture",   emoji: "💨", label: "I forget to write things down",  ack: "We'll make capturing things instant."       },
  { id: "drift",     emoji: "👻", label: "I start strong, then drift away", ack: "We'll make it easy to come back."           },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [ack, setAck] = useState("");

  function choose(opt: typeof OPTIONS[number]) {
    setSelected(opt.id);
    setAck(opt.ack);
    localStorage.setItem("focus_onboarding", opt.id);
    // Funnel event: user completed onboarding (opt-in only, PII-free)
    trackEvent("signup_completed");
    trackEvent("onboarding_completed");
    setTimeout(() => router.push("/app/today"), 1500);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Welcome.</h1>
      <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
        What's your main challenge with staying on top of tasks?
      </p>
      <div className="w-full space-y-3">
        {OPTIONS.map((opt) => (
          <button key={opt.id} onClick={() => choose(opt)}
            className="w-full px-5 py-4 rounded-lg text-left text-base font-medium transition-all"
            style={{
              background: selected === opt.id ? "#1e3a1a" : "var(--bg-elevated)",
              border: `1px solid ${selected === opt.id ? "var(--accent-green)" : "var(--border)"}`,
              color: "var(--text-primary)",
            }}>
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>
      {ack && <p className="mt-4 text-sm" style={{ color: "var(--accent-green)" }}>{ack}</p>}
      <button onClick={() => router.push("/app/today")}
        className="mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
        Skip for now →
      </button>
    </main>
  );
}
