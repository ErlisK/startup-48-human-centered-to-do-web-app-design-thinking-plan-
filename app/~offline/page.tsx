export default function OfflinePage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "var(--bg-base)", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📵</div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
        You&apos;re offline
      </h1>
      <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 340, lineHeight: 1.6, marginBottom: 24 }}>
        No connection right now. Tasks you add will be saved locally and synced when you&apos;re back online.
      </p>
      <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
        Previously visited pages are still available below.
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/app/today" style={{ padding: "10px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Today</a>
        <a href="/app/inbox" style={{ padding: "10px 20px", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14 }}>Inbox</a>
      </div>
    </div>
  );
}
