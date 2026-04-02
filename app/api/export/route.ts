import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// RFC 4180 CSV serialisation
function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = Array.isArray(val) ? val.join(";") : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const HEADERS = [
  "id", "title", "tags", "priority", "due_at",
  "completed_at", "deleted_at", "time_estimate_minutes", "created_at",
];

export async function GET(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format") ?? "csv";

  // Fetch ALL tasks (including completed and soft-deleted) for full export
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tasks, error } = await (supabase as any)
    .from("tasks")
    .select("id,title,tags,priority,due_at,completed_at,deleted_at,time_estimate_minutes,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = new Date().toISOString().split("T")[0];

  if (format === "json") {
    return new NextResponse(JSON.stringify({ exported_at: new Date().toISOString(), tasks }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="focus-tasks-${now}.json"`,
        "Cache-Control": "no-store, private",
      },
    });
  }

  // Default: CSV
  const rows = (tasks ?? []).map((t: Record<string, unknown>) =>
    HEADERS.map((h) => escapeCSV(t[h])).join(",")
  );
  const csv = [HEADERS.join(","), ...rows].join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="focus-tasks-${now}.csv"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
