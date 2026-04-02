"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SyncIndicator } from "./SyncIndicator";
import { useSyncState } from "@/hooks/useSyncState";

export function NavBar() {
  const pathname = usePathname();
  const { state, count } = useSyncState();
  const isToday = pathname?.includes("/today");
  const isInbox = pathname?.includes("/inbox");

  return (
    <nav style={{ background: "var(--bg-base)", borderBottom: "1px solid var(--border)", padding: "0 14px", height: 44, display: "flex", alignItems: "center", gap: 24, maxWidth: 640, margin: "0 auto", width: "100%", position: "sticky", top: 0, zIndex: 40 }}>
      <Link href="/app/today" style={{ color: "var(--accent-blue)", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>✦ focus</Link>
      <Link href="/app/today" style={{ fontSize: 14, color: isToday ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isToday ? 600 : 400, textDecoration: "none", padding: "2px 8px", borderRadius: 4, background: isToday ? "var(--bg-elevated)" : "transparent" }}>Today</Link>
      <Link href="/app/inbox" style={{ fontSize: 14, color: isInbox ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isInbox ? 600 : 400, textDecoration: "none", padding: "2px 8px", borderRadius: 4, background: isInbox ? "var(--bg-elevated)" : "transparent" }}>Inbox</Link>
      <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <SyncIndicator state={state} count={count} />
        <Link href="/app/settings" style={{ color: "var(--text-muted)", fontSize: 18, textDecoration: "none" }} aria-label="Settings">···</Link>
      </span>
    </nav>
  );
}
