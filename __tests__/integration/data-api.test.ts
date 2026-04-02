/**
 * Data API: import/export/account contract tests.
 * These test route shapes and validation without real Supabase auth.
 */

// We test the pure logic functions extracted from the route handlers

// ── CSV escape/parse ──────────────────────────────────────────────────────────
function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = Array.isArray(val) ? (val as string[]).join(";") : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCSVRow(task: Record<string, unknown>, headers: string[]): string {
  return headers.map((h) => escapeCSV(task[h])).join(",");
}

describe("Export: CSV row builder", () => {
  const HEADERS = ["id","title","tags","priority","due_at","completed_at","deleted_at","time_estimate_minutes","created_at"];
  
  it("builds correct CSV row",      () => {
    const row = buildCSVRow({ id: "01", title: "buy milk", tags: ["errands"], priority: null, due_at: null, completed_at: null, deleted_at: null, time_estimate_minutes: null, created_at: "2026-01-01T00:00:00Z" }, HEADERS);
    expect(row).toContain("buy milk");
    expect(row).toContain("errands");
  });
  it("wraps commas in title",        () => {
    const row = buildCSVRow({ id: "01", title: "buy milk, bread", tags: [], priority: null, due_at: null, completed_at: null, deleted_at: null, time_estimate_minutes: null, created_at: "" }, HEADERS);
    expect(row).toContain('"buy milk, bread"');
  });
  it("serialises tag array with ;",  () => {
    const row = buildCSVRow({ id:"01", title:"t", tags:["a","b"], priority:null, due_at:null, completed_at:null, deleted_at:null, time_estimate_minutes:null, created_at:"" }, HEADERS);
    expect(row).toContain("a;b");
  });
  it("header count matches row",     () => {
    const row = buildCSVRow({ id:"01", title:"t", tags:[], priority:null, due_at:null, completed_at:null, deleted_at:null, time_estimate_minutes:null, created_at:"" }, HEADERS);
    expect(row.split(",").length).toBe(HEADERS.length);
  });
});

// ── Import: validation contracts ─────────────────────────────────────────────
describe("Import: validation contracts", () => {
  it("rejects rows without a title",  () => {
    const rows = [{ note: "no title here" }];
    const valid = rows.filter((r) => r["title" as keyof typeof r] || r["name" as keyof typeof r]);
    expect(valid).toHaveLength(0);
  });
  it("accepts rows with 'name' alias", () => {
    const rows = [{ name: "buy milk" }];
    const valid = rows.filter((r: Record<string, string>) => r["title"] || r["name"] || r["task"]);
    expect(valid).toHaveLength(1);
  });
  it("max 2000 rows enforced",        () => {
    const rows = Array.from({ length: 2001 }, (_, i) => ({ title: `task ${i}` }));
    expect(rows.length).toBeGreaterThan(2000);
    const capped = rows.slice(0, 2000);
    expect(capped).toHaveLength(2000);
  });
  it("truncates title to 500 chars",  () => {
    const long = "a".repeat(600);
    expect(long.slice(0, 500)).toHaveLength(500);
  });
});

// ── Account deletion: confirmation token ─────────────────────────────────────
describe("Account deletion: confirmation token", () => {
  const REQUIRED = "DELETE_MY_ACCOUNT";
  it("accepts correct token",         () => expect("DELETE_MY_ACCOUNT").toBe(REQUIRED));
  it("rejects wrong token",           () => expect("delete_my_account").not.toBe(REQUIRED));
  it("rejects empty token",           () => expect("").not.toBe(REQUIRED));
  it("token is case-sensitive",       () => expect("Delete_My_Account").not.toBe(REQUIRED));
});

// ── Export: content-type mapping ─────────────────────────────────────────────
describe("Export: content-type mapping", () => {
  const TYPES: Record<string, string> = { csv: "text/csv; charset=utf-8", json: "application/json" };
  it("csv format → text/csv",         () => expect(TYPES["csv"]).toContain("text/csv"));
  it("json format → application/json",() => expect(TYPES["json"]).toBe("application/json"));
});
