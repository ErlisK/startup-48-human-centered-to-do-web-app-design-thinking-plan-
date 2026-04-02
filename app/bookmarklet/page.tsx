"use client";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://focus-todo-app-delta.vercel.app";

function buildBookmarklet(appUrl: string) {
  const code = `(function(){var u=encodeURIComponent(location.href);var t=encodeURIComponent(document.title);window.open('${appUrl}/capture?url='+u+'&title='+t,'focus_capture','width=420,height=220,top='+((screen.height-220)/2)+',left='+((screen.width-420)/2));})();`;
  return `javascript:${code}`;
}

export default function BookmarkletPage() {
  const bk = buildBookmarklet(APP_URL);

  function handleBookmarkletClick(e: React.MouseEvent) {
    e.preventDefault();
    alert("Drag this button to your bookmarks bar instead of clicking it.");
  }

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px", background: "var(--bg-base)" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <Link href="/" style={{ color: "var(--accent-blue)", fontWeight: 700, fontSize: 20, textDecoration: "none" }}>✦ focus</Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginTop: 24, marginBottom: 8 }}>
          Capture from anywhere
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Drag the button below to your browser&apos;s bookmarks bar.
          Click it on any page to capture that page as a task instantly.
        </p>

        <div style={{ marginBottom: 32, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href={bk} draggable onClick={handleBookmarkletClick}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "var(--accent-blue)", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: "none", cursor: "grab" }}
            aria-label="Drag to bookmarks bar to install">
            ✦ Save to focus
          </a>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>
            ← Drag to bookmarks bar<br />
            <span style={{ fontSize: 12 }}>Show bar: Ctrl+Shift+B / ⌘+Shift+B</span>
          </div>
        </div>

        <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: 20, border: "1px solid var(--border)", marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Manual install</h2>
          <ol style={{ paddingLeft: 18, color: "var(--text-secondary)", fontSize: 14, lineHeight: 2 }}>
            <li>Right-click bookmarks bar → <strong>Add page…</strong></li>
            <li>Name: <strong>Save to focus</strong></li>
            <li>URL: paste the code below</li>
          </ol>
          <textarea readOnly value={bk} rows={3}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            style={{ width: "100%", marginTop: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: 11, fontFamily: "monospace", padding: 10, resize: "vertical" }}
            aria-label="Bookmarklet code — click to select"
          />
        </div>

        <div style={{ background: "var(--bg-surface)", borderRadius: 8, padding: 20, border: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Already in the app?</h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Press{" "}
            <kbd style={{ background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 3 }}>⌘K</kbd>
            {" "}or{" "}
            <kbd style={{ background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 3 }}>Ctrl+K</kbd>
            {" "}anywhere to open instant capture.
          </p>
        </div>
      </div>
    </div>
  );
}
