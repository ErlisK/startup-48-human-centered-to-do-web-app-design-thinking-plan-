import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const view = req.nextUrl.searchParams.get("view") ?? "inbox";
  const tag  = req.nextUrl.searchParams.get("tag");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  let data, error;

  if (view === "today") {
    ({ data, error } = await db.rpc("today_tasks", { p_user_id: user.id }));
  } else if (view === "done-today") {
    ({ data, error } = await db.rpc("done_today", { p_user_id: user.id }));
  } else {
    let q = db.from("tasks").select("*").eq("user_id", user.id).is("deleted_at", null).is("completed_at", null);
    if (tag) q = q.contains("tags", [tag]);
    ({ data, error } = await q.order("created_at", { ascending: false }));
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data ?? [] }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, title, tags, priority, due_at, time_estimate_minutes } = body;
  if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const task = { id: id ?? undefined, user_id: user.id, title: title.trim(), tags: tags ?? [], priority: priority ?? null, due_at: due_at ?? null, time_estimate_minutes: time_estimate_minutes ?? null };
  const { data, error } = await db.from("tasks").insert(task).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data }, { status: 201 });
}
