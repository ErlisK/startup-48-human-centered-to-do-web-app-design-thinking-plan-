import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { writeAuditLog, getRequestIp, getUserAgent } from "@/lib/security/audit";
import { sanitizeText, sanitizePriority, sanitizeDate, sanitizeTags } from "@/lib/security/sanitize";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_ROWS      = 2000;

const COL_ALIASES: Record<string, string> = {
  name: "title", task: "title", content: "title", text: "title",
  labels: "tags", categories: "tags",
  due: "due_at", due_date: "due_at", duedate: "due_at",
  done: "completed_at", completed: "completed_at", done_at: "completed_at",
  estimate: "time_estimate_minutes",
};

function splitCSVLine(line: string): string[] {
  const vals: string[] = [];
  let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) { vals.push(cur); cur = ""; }
    else cur += ch;
  }
  vals.push(cur);
  return vals;
}

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const rawHeaders = splitCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => {
    const norm = h.trim().toLowerCase().replace(/\s+/g, "_");
    return COL_ALIASES[norm] ?? norm;
  });
  return lines.slice(1).map((line) => {
    const vals = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (vals[i] ?? "").trim(); });
    return row;
  }).filter((r) => r["title"]);
}

export async function POST(req: NextRequest) {
  const { ok, retryAfter } = await rateLimit(req, { prefix: "import", window: 300, max: 5 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let csvText = "";
  const ct = req.headers.get("content-type") ?? "";

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
    csvText = await file.text();
  } else {
    csvText = await req.text();
    if (csvText.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Request body too large (max 5 MB)" }, { status: 413 });
    }
  }

  const rows = parseCSV(csvText).slice(0, MAX_ROWS);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows found. CSV must have a title/name/task column." }, { status: 400 });
  }

  const tasks = rows.map((row) => ({
    id:                    row["id"] && row["id"].length > 10 ? row["id"] : crypto.randomUUID(),
    user_id:               user.id,
    title:                 sanitizeText(row["title"] ?? "", 500),
    tags:                  sanitizeTags(row["tags"] ? row["tags"].split(";").map(t => t.trim()) : []),
    priority:              sanitizePriority(row["priority"]),
    due_at:                sanitizeDate(row["due_at"]),
    completed_at:          sanitizeDate(row["completed_at"]),
    time_estimate_minutes: row["time_estimate_minutes"] ? Number(row["time_estimate_minutes"]) || null : null,
    created_at:            sanitizeDate(row["created_at"]) ?? new Date().toISOString(),
  })).filter((t) => t.title);

  let imported = 0;
  let skipped  = 0;
  const BATCH  = 100;

  for (let i = 0; i < tasks.length; i += BATCH) {
    const batch = tasks.slice(i, i + BATCH);
    const { error } = await db
      .from("tasks")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false });
    if (error) { skipped += batch.length; }
    else { imported += batch.length; }
  }

  void writeAuditLog({
    action: "data.import",
    userId: user.id,
    meta: { total: rows.length, imported, skipped },
    ip: getRequestIp(req.headers),
    userAgent: getUserAgent(req.headers),
  });

  return NextResponse.json({ ok: true, imported, skipped, total: rows.length });
}
