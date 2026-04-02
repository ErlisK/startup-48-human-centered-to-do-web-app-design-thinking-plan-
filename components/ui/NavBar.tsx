"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SyncIndicator } from "./SyncIndicator";
import { useSyncState } from "@/hooks/useSyncState";

export function NavBar() {
  const pathname  = usePathname();
  const { state, count } = useSyncState();
  const isToday   = !!pathname?.includes("/today");
  const isInbox   = !!pathname?.includes("/inbox");

  return (
    <header role="banner">
      <nav role="navigation" aria-label="Main navigation"
        style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)", padding: "0 14px", height: 44, display: "flex", alignItems: "center", gap: 24, maxWidth: 640, margin: "0 auto", width: "100%", position: "sticky", top: 0, zIndex: 40 }}>

        <Link href="/app/today"
          aria-label="focus — go to Today"
          style={{ color: "var(--accent-blue)", fontWeight: 800, fontSize: 17, textDecoration: "none", flexShrink: 0 }}>
          ✦ focus
        </Link>

        <Link href="/app/today"
          aria-current={isToday ? "page" : undefined}
          style={{ fontSize: 14, color: isToday ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isToday ? 600 : 400, textDecoration: "none", padding: "2px 8px", borderRadius: 4, background: isToday ? "var(--bg-elevated)" : "transparent" }}>
          Today
        </Link>

        <Link href="/app/inbox"
          aria-current={isInbox ? "page" : undefined}
          style={{ fontSize: 14, color: isInbox ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isInbox ? 600 : 400, textDecoration: "none", padding: "2px 8px", borderRadius: 4, background: isInbox ? "var(--bg-elevated)" : "transparent" }}>
          Inbox
        </Link>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <SyncIndicator state={state} count={count} />
          <Link href="/app/settings"
            aria-label="Settings"
            style={{ color: "var(--text-muted)", fontSize: 22, textDecoration: "none", lineHeight: 1, padding: "4px", display: "flex", alignItems: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </Link>
        </div>
      </nav>
    </header>
  );
}
