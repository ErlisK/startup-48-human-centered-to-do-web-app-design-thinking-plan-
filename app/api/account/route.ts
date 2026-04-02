import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { writeAuditLog, getRequestIp, getUserAgent } from "@/lib/security/audit";

export async function DELETE(req: NextRequest) {
  // Very strict rate limit: 3 attempts per 15 minutes
  const { ok, retryAfter } = await rateLimit(req, { prefix: "account-delete", window: 900, max: 3 });
  if (!ok) return rateLimitResponse(retryAfter);

  const supabase = await getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Safety gate: require explicit confirmation
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  if (body.confirm !== "DELETE_MY_ACCOUNT") {
    return NextResponse.json(
      { error: "Confirmation required. Send { \"confirm\": \"DELETE_MY_ACCOUNT\" }" },
      { status: 400 }
    );
  }

  const ip        = getRequestIp(req.headers);
  const userAgent = getUserAgent(req.headers);
  const userId    = user.id;

  // Pre-deletion audit log
  void writeAuditLog({
    action: "account.delete",
    userId,
    meta: { stage: "initiated" },
    ip,
    userAgent,
  });

  // Hard-delete all tasks first
  const { error: tasksErr } = await db
    .from("tasks")
    .delete()
    .eq("user_id", userId);

  if (tasksErr) {
    return NextResponse.json({ error: "Failed to delete task data" }, { status: 500 });
  }

  // Delete auth user via admin client
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { error: authErr } = await adminClient.auth.admin.deleteUser(userId);
  if (authErr) {
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }

  // Sign out
  await db.auth.signOut();

  return NextResponse.json({ ok: true, message: "Account and all data deleted permanently." });
}
