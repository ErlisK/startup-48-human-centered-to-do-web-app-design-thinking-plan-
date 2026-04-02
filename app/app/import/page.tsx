"use client";
import { useState, useRef, useId } from "react";
import Link from "next/link";
import type { Metadata } from "next";

interface ImportResult {
  ok: boolean;
  imported: number;
  skipped: number;
  total: number;
  error?: string;
}

export default function ImportPage() {
  const fileId          = useId();
  const dropRef         = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<string[]>([]);
  const [error, setError]     = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f) pickFile(f);
  }

  async function pickFile(f: File) {
    if (!f.name.endsWith(".csv")) { setError("Only .csv files are supported"); return; }
    if (f.size > 5 * 1024 * 1024) { setError("File too large (max 5 MB)"); return; }
    setFile(f); setError(""); setResult(null);
    // Show first 3 data rows as preview
    const text  = await f.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    setPreview(lines.slice(0, 4)); // header + up to 3 rows
  }

  async function handleImport() {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res  = await fetch("/api/import", { method: "POST", body: form });
      const data: ImportResult = await res.json();
      if (!res.ok) { setError(data.error ?? "Import failed"); return; }
      setResult(data);
      setFile(null); setPreview([]);
    } catch {
      setError("Network error — please try again");
    } finally { setLoading(false); }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }

  const S = {
    card: { background: "var(--bg-surface)", borderRadius: 10, border: "1px solid var(--border)", padding: 20, marginBottom: 16 } as React.CSSProperties,
    h2:   { fontSize: 13, color: "var(--text-muted)", marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: 1, fontWeight: 600 },
    btn:  (primary: boolean) => ({ padding: "10px 20px", background: primary ? "var(--accent-green)" : "var(--bg-elevated)", color: primary ? "#0d1117" : "var(--text-secondary)", borderRadius: "var(--radius)", fontWeight: primary ? 700 : 500, border: primary ? "none" : "1px solid var(--border)", cursor: "pointer", fontSize: 14 } as React.CSSProperties),
  };

  return (
    <div style={{ padding: "20px 16px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/app/settings" aria-label="Back to Settings"
          style={{ color: "var(--text-muted)", fontSize: 18, textDecoration: "none", lineHeight: 1 }}>←</Link>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Import tasks</h1>
      </div>

      {/* Supported formats */}
      <section aria-labelledby="formats-heading" style={S.card}>
        <h2 id="formats-heading" style={S.h2}>Supported formats</h2>
        <ul style={{ paddingLeft: 18, color: "var(--text-secondary)", fontSize: 13, lineHeight: 2, margin: 0 }}>
          <li><strong>focus export CSV</strong> — from Settings → Export</li>
          <li><strong>Todoist CSV</strong> — Export → CSV (Tasks)</li>
          <li><strong>Any CSV</strong> with a <code>title</code>, <code>name</code>, or <code>task</code> column</li>
        </ul>
        <p style={{ marginTop: 10, fontSize: 12, color: "var(--text-muted)" }}>
          Columns auto-detected: title, tags, priority, due_at, completed_at, created_at, time_estimate_minutes.
          Max 2,000 rows per import, max 5 MB.
        </p>
      </section>

      {/* Drop zone */}
      <section aria-labelledby="upload-heading">
        <h2 id="upload-heading" style={{ ...S.h2, marginBottom: 8 }}>Upload file</h2>
        <div
          ref={dropRef}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          style={{ border: `2px dashed ${drag ? "var(--accent-blue)" : "var(--border)"}`, borderRadius: 8, padding: "32px 20px", textAlign: "center", background: drag ? "#0d1a2a" : "var(--bg-surface)", transition: "all 120ms", marginBottom: 16, cursor: "pointer" }}
          onClick={() => document.getElementById(fileId)?.click()}
          role="button"
          tabIndex={0}
          aria-label="Drop a CSV file here or click to browse"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") document.getElementById(fileId)?.click(); }}
        >
          <p style={{ fontSize: 32, marginBottom: 8 }} aria-hidden="true">📂</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 6 }}>
            {file ? file.name : "Drop a CSV here or click to browse"}
          </p>
          {file && (
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
          <label htmlFor={fileId} className="sr-only">Choose CSV file</label>
          <input id={fileId} type="file" accept=".csv,text/csv" onChange={handleFileChange}
            style={{ display: "none" }} aria-label="Choose CSV file" />
        </div>

        {error && (
          <p role="alert" style={{ color: "var(--accent-red)", fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}
      </section>

      {/* Preview */}
      {preview.length > 0 && (
        <section aria-labelledby="preview-heading" style={{ ...S.card, overflowX: "auto" }}>
          <h2 id="preview-heading" style={S.h2}>Preview (first {preview.length - 1} rows)</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  {row.split(",").slice(0, 6).map((cell, j) => (
                    <td key={j} style={{ padding: "4px 8px", color: i === 0 ? "var(--text-muted)" : "var(--text-secondary)", fontWeight: i === 0 ? 600 : 400, whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {cell.replace(/^"|"$/g, "").slice(0, 40)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Import result */}
      {result && (
        <div role="status" aria-live="polite"
          style={{ background: "#0d2a0d", border: "1px solid var(--accent-green)", borderRadius: "var(--radius)", padding: "14px 16px", marginBottom: 16 }}>
          <p style={{ color: "var(--accent-green)", fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
            ✓ Import complete
          </p>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {result.imported} task{result.imported !== 1 ? "s" : ""} imported
            {result.skipped > 0 ? `, ${result.skipped} skipped` : ""}
            {" "}out of {result.total} rows.
          </p>
          <Link href="/app/inbox"
            style={{ display: "inline-block", marginTop: 10, color: "var(--accent-blue)", textDecoration: "underline", fontSize: 13 }}>
            View in Inbox →
          </Link>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handleImport} disabled={!file || loading}
          style={{ ...S.btn(true), opacity: !file || loading ? 0.5 : 1, flex: 1 }}
          aria-busy={loading} aria-disabled={!file || loading}>
          {loading ? "Importing…" : `Import${file ? ` "${file.name}"` : ""}`}
        </button>
        {file && (
          <button onClick={() => { setFile(null); setPreview([]); setError(""); }}
            style={S.btn(false)} aria-label="Clear selected file">
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
