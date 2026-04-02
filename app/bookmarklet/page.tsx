"use client";
import Link from "next/link";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://focus-todo-app-delta.vercel.app";

function buildBookmarklet(appUrl: string) {
  const code = `(function(){var u=encodeURIComponent(location.href);var t=encodeURIComponent(document.title);window.open('${appUrl}/capture?url='+u+'&title='+t,'focus_capture','width=420,height=220,top='+((screen.height-220)/2)+',left='+((screen.width-420)/2));})();`;
  return `javascript:${code}`;
}

// Renders bookmarklet anchor via innerHTML to allow javascript: href for drag-to-install
function BookmarkletLink({ href }: { href: string }) {
  const ref = (node: HTMLSpanElement | null) => {
    if (!node || node.firstChild) return;
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.setAttribute("draggable", "true");
    a.style.cssText = "display:inline-flex;align-items:center;gap:8px;padding:12px 20px;background:var(--accent-blue);color:#0d1117;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;cursor:grab;";
    a.setAttribute("aria-label", "Drag to bookmarks bar to install Save to focus bookmarklet");
    a.textContent = "✦ Save to focus";
    a.addEventListener("click", (e) => { e.preventDefault(); window.alert("Drag this button to your bookmarks bar instead of clicking it."); });
    node.appendChild(a);
  };
  return <span ref={ref} />;
}

export default function BookmarkletPage() {
  const bk = buildBookmarklet(APP_URL);

  function handleBookmarkletClick(e: React.MouseEvent) {
    e.preventDefault();
    window.alert("Drag this button to your bookmarks bar instead of clicking it.");
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--bg-base)" }}>
      {/* Site nav — distinct from content */}
      <nav aria-label="Site navigation" style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
        <Link href="/"
          style={{ color: "var(--accent-blue)", fontWeight: 800, fontSize: 18, textDecoration: "none" }}
          aria-label="focus — go to home">
          ✦ focus
        </Link>
      </nav>

      <main aria-label="Bookmarklet install" style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>
          Capture from anywhere
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, marginBottom: 32, lineHeight: 1.6 }}>
          Drag the button to your bookmarks bar. Click it on any page to save it as a task instantly.
        </p>

        {/* Bookmarklet install button */}
        <section aria-label="Bookmarklet install" style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <BookmarkletLink href={bk} />
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              ← Drag to bookmarks bar<br />
              <span style={{ fontSize: 12 }}>Show bar: <kbd>Ctrl+Shift+B</kbd> / <kbd>⌘+Shift+B</kbd></span>
            </p>
          </div>
        </section>

        {/* Manual install */}
        <section aria-labelledby="manual-heading" style={{ background: "var(--bg-surface)", borderRadius: 8, padding: 20, border: "1px solid var(--border)", marginBottom: 16 }}>
          <h2 id="manual-heading" style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            Manual install
          </h2>
          <ol style={{ paddingLeft: 18, color: "var(--text-secondary)", fontSize: 14, lineHeight: 2, margin: 0 }}>
            <li>Right-click bookmarks bar → <strong>Add page…</strong></li>
            <li>Name: <strong>Save to focus</strong></li>
            <li>URL: paste the code below</li>
          </ol>
          <label htmlFor="bk-code" className="sr-only">Bookmarklet code — click to select all</label>
          <textarea
            id="bk-code"
            readOnly
            value={bk}
            rows={3}
            onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            style={{ width: "100%", marginTop: 10, background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius)", color: "var(--text-muted)", fontSize: 11, fontFamily: "monospace", padding: 10, resize: "vertical" }}
          />
        </section>

        {/* Keyboard shortcut */}
        <section aria-labelledby="shortcut-heading" style={{ background: "var(--bg-surface)", borderRadius: 8, padding: 20, border: "1px solid var(--border)" }}>
          <h2 id="shortcut-heading" style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            Already in the app?
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            Press{" "}
            <kbd style={{ background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 3 }}>⌘K</kbd>
            {" "}or{" "}
            <kbd style={{ background: "var(--bg-elevated)", padding: "2px 7px", borderRadius: 3 }}>Ctrl+K</kbd>
            {" "}anywhere to open instant capture.
          </p>
        </section>
      </main>
    </div>
  );
}
