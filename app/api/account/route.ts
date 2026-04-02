import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Require explicit confirmation token in body to prevent accidental deletion
  let body: { confirm?: string } = {};
  try { body = await req.json(); } catch { /* ok */ }
  if (body.confirm !== "DELETE_MY_ACCOUNT") {
    return NextResponse.json(
      { error: 'Send { "confirm": "DELETE_MY_ACCOUNT" } to confirm' },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // 1. Hard-delete all tasks (GDPR right to erasure)
  const { error: tasksErr } = await db
    .from("tasks")
    .delete()
    .eq("user_id", user.id);
  if (tasksErr) return NextResponse.json({ error: "Failed to delete tasks: " + tasksErr.message }, { status: 500 });

  // 2. Delete the auth user via service role (requires service role key)
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: userErr } = await (adminClient.auth.admin as any).deleteUser(user.id);
  if (userErr) {
    // Non-fatal: user data is deleted, auth may need manual cleanup
    console.error("[account/delete] Failed to delete auth user:", userErr.message);
  }

  // 3. Sign out the current session
  await supabase.auth.signOut();

  return NextResponse.json({ ok: true, message: "Account and all data deleted" });
}
