"use client";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useState } from "react";

export function InstallBanner() {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return !!localStorage.getItem("focus_install_dismissed");
  });

  if (!canInstall || dismissed) return null;

  return (
    <div className="install-banner" role="banner" aria-label="Install app">
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Install ✦ focus</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Works offline · No app store needed</div>
      </div>
      <button onClick={async () => { await install(); }}
        style={{ padding: "8px 16px", background: "var(--accent-green)", color: "#0d1117", borderRadius: "var(--radius)", fontWeight: 700, border: "none", cursor: "pointer", fontSize: 14 }}>
        Install
      </button>
      <button onClick={() => { localStorage.setItem("focus_install_dismissed", "1"); setDismissed(true); }}
        style={{ padding: "8px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}
        aria-label="Dismiss install banner">
        ×
      </button>
    </div>
  );
}
