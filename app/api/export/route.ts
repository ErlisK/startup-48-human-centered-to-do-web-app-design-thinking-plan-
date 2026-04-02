import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { writeAuditLog, getRequestIp, getUserAgent } from "@/lib/security/audit";
import type { Task } from "@/lib/supabase/types";

const HEADERS: (keyof Task)[] = [
  "id","title","tags","priority","due_at","completed_at","deleted_at","time_estimate_minutes","created_at",
];

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = Array.isArray(val) ? (val as string[]).join(";") : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  // Strict rate limit: exports are heavy — 10 per 10 minutes
  const { ok, retryAfter } = await rateLimit(req, { prefix: "export", window: 600, max: 10 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: tasks, error } = await db
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const format = new URL(req.url).searchParams.get("format") ?? "csv";
  const date   = new Date().toISOString().split("T")[0];

  void writeAuditLog({
    action: "data.export",
    userId: user.id,
    meta: { format, count: tasks?.length ?? 0 },
    ip: getRequestIp(req.headers),
    userAgent: getUserAgent(req.headers),
  });

  if (format === "json") {
    return new NextResponse(JSON.stringify(tasks ?? [], null, 2), {
      headers: {
        "Content-Type":        "application/json",
        "Content-Disposition": `attachment; filename="focus-tasks-${date}.json"`,
        "Cache-Control":       "no-store, private",
      },
    });
  }

  // Default: CSV
  const rows = [
    HEADERS.join(","),
    ...(tasks ?? []).map((t: Task) =>
      HEADERS.map((h) => escapeCSV(t[h])).join(",")
    ),
  ].join("\r\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="focus-tasks-${date}.csv"`,
      "Cache-Control":       "no-store, private",
    },
  });
}
