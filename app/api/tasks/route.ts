import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ulid as generateULID } from "@/lib/offline/ulid";
import { rateLimit, rateLimitResponse, rateLimitHeaders } from "@/lib/security/rate-limit";
import { writeAuditLog, getRequestIp, getUserAgent } from "@/lib/security/audit";
import { sanitizeText, sanitizePriority, sanitizeDate, sanitizeTags } from "@/lib/security/sanitize";

export async function GET(req: NextRequest) {
  const { ok, remaining, retryAfter } = await rateLimit(req, { prefix: "tasks-get", window: 60, max: 120 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "inbox";

  let query = db
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filter === "today") {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    query = query
      .gte("due_at", start.toISOString())
      .lte("due_at", end.toISOString());
  } else if (filter === "completed") {
    query = query.not("completed_at", "is", null);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, {
    headers: rateLimitHeaders(remaining, 120, 60),
  });
}

export async function POST(req: NextRequest) {
  const { ok, remaining, retryAfter } = await rateLimit(req, { prefix: "tasks-post", window: 60, max: 30 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Sanitise all user input
  const title = sanitizeText(String(body.title ?? ""), 500);
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const task = {
    id:                     String(body.id ?? generateULID()),
    user_id:                user.id,
    title,
    tags:                   sanitizeTags(body.tags),
    priority:               sanitizePriority(body.priority),
    due_at:                 sanitizeDate(body.due_at),
    time_estimate_minutes:  body.time_estimate_minutes ? Math.min(Math.max(1, Number(body.time_estimate_minutes)), 480) : null,
  };

  const { data, error } = await db.from("tasks").insert(task).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Audit log (non-blocking)
  void writeAuditLog({
    action: "task.create",
    userId: user.id,
    resource: task.id,
    ip: getRequestIp(req.headers),
    userAgent: getUserAgent(req.headers),
  });

  return NextResponse.json(data, {
    status: 201,
    headers: rateLimitHeaders(remaining, 30, 60),
  });
}
