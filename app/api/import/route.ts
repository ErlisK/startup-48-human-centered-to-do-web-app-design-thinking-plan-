import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

// Minimal RFC 4180 CSV parser (handles quoted fields with embedded commas/newlines)
function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  const rows: Array<Record<string, string>> = [];
  let i = 1;
  while (i < lines.length) {
    let line = lines[i];
    // Handle multi-line quoted fields
    while ((line.match(/"/g) ?? []).length % 2 !== 0 && i + 1 < lines.length) {
      i++;
      line += "\n" + lines[i];
    }
    const values = splitCSVLine(line);
    if (values.length === 0) { i++; continue; }
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = (values[idx] ?? "").trim(); });
    if (row["title"] || row["name"] || row["task"]) rows.push(row);
    i++;
  }
  return rows;
}

function splitCSVLine(line: string): string[] {
  const values: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      values.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  values.push(cur);
  return values;
}

function parseDate(val: string): string | null {
  if (!val || val === "null" || val === "undefined" || val === "") return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function parsePriority(val: string): number | null {
  if (!val) return null;
  const n = parseInt(val, 10);
  if (!isNaN(n) && n >= 1 && n <= 4) return n;
  const map: Record<string, number> = { high: 1, urgent: 1, medium: 2, normal: 3, low: 4 };
  return map[val.toLowerCase()] ?? null;
}

function parseTags(val: string): string[] {
  if (!val || val === "null") return [];
  return val.split(/[;,|]+/).map((t) => t.trim().replace(/^#/, "")).filter(Boolean);
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Accept multipart/form-data with a "file" field OR raw text/csv body
  let csvText = "";
  const ct = req.headers.get("content-type") ?? "";

  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.name.endsWith(".csv") && !ct.includes("text/csv")) {
      return NextResponse.json({ error: "File must be a .csv" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
    csvText = await file.text();
  } else {
    const body = await req.text();
    if (!body.trim()) return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    csvText = body;
  }

  const rows = parseCSV(csvText);
  if (rows.length === 0) return NextResponse.json({ error: "No valid rows found in CSV" }, { status: 422 });
  if (rows.length > 2000) return NextResponse.json({ error: "Too many rows (max 2000 per import)" }, { status: 422 });

  const now = new Date().toISOString();

  const tasks = rows.map((row) => {
    // Accept both "focus export" column names and common app exports (Todoist, etc.)
    const title = (row["title"] || row["name"] || row["task"] || row["content"] || "").trim();
    return {
      id:                    row["id"] && row["id"].length > 10 ? row["id"] : randomUUID(),
      user_id:               user.id,
      title:                 title.slice(0, 500),
      tags:                  parseTags(row["tags"] || row["labels"] || row["tag"] || ""),
      priority:              parsePriority(row["priority"] || row["p"] || ""),
      due_at:                parseDate(row["due_at"] || row["due"] || row["due_date"] || ""),
      completed_at:          parseDate(row["completed_at"] || row["completed"] || row["done_at"] || ""),
      deleted_at:            null,   // never import deleted tasks
      time_estimate_minutes: parseInt(row["time_estimate_minutes"] || row["time_estimate"] || "0", 10) || null,
      created_at:            parseDate(row["created_at"] || row["created"] || "") ?? now,
    };
  }).filter((t) => t.title.length > 0);

  if (tasks.length === 0) return NextResponse.json({ error: "No tasks with a title found" }, { status: 422 });

  // Upsert in batches of 100
  let imported = 0, skipped = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  for (let i = 0; i < tasks.length; i += 100) {
    const batch = tasks.slice(i, i + 100);
    const { error: upsertErr, count } = await db
      .from("tasks")
      .upsert(batch, { onConflict: "id", ignoreDuplicates: false })
      .select("id", { count: "exact", head: true });
    if (upsertErr) { skipped += batch.length; continue; }
    imported += count ?? batch.length;
  }

  return NextResponse.json({
    ok: true,
    imported,
    skipped,
    total: tasks.length,
  }, { status: 201 });
}
