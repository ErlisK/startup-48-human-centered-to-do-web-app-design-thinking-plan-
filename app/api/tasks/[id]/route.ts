import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { writeAuditLog, getRequestIp, getUserAgent } from "@/lib/security/audit";
import { sanitizeText, sanitizePriority, sanitizeDate, sanitizeTags } from "@/lib/security/sanitize";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok, retryAfter } = await rateLimit(req, { prefix: "tasks-patch", window: 60, max: 60 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Build sanitised update payload — only allow known fields
  const patch: Record<string, unknown> = {};
  if (body.title         !== undefined) patch.title         = sanitizeText(String(body.title), 500);
  if (body.tags          !== undefined) patch.tags          = sanitizeTags(body.tags);
  if (body.priority      !== undefined) patch.priority      = sanitizePriority(body.priority);
  if (body.due_at        !== undefined) patch.due_at        = sanitizeDate(body.due_at);
  if (body.completed_at  !== undefined) patch.completed_at  = sanitizeDate(body.completed_at);
  if (body.deleted_at    !== undefined) patch.deleted_at    = sanitizeDate(body.deleted_at);
  if (body.time_estimate_minutes !== undefined) {
    const v = Number(body.time_estimate_minutes);
    patch.time_estimate_minutes = isNaN(v) ? null : Math.min(Math.max(1, v), 480);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  // Ensure user owns this task (RLS also enforces this — belt & suspenders)
  const { data, error } = await db
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const action = patch.completed_at ? "task.complete" : patch.deleted_at ? "task.delete" : "task.update";
  void writeAuditLog({
    action,
    userId: user.id,
    resource: id,
    ip: getRequestIp(req.headers),
    userAgent: getUserAgent(req.headers),
  });

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { ok, retryAfter } = await rateLimit(req, { prefix: "tasks-delete", window: 60, max: 30 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Soft delete — set deleted_at (RLS enforces user_id ownership)
  const { error } = await db
    .from("tasks")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  void writeAuditLog({
    action: "task.delete",
    userId: user.id,
    resource: id,
    ip: getRequestIp(req.headers),
    userAgent: getUserAgent(req.headers),
  });

  return new NextResponse(null, { status: 204 });
}
