/**
 * CSV import: parser unit tests.
 * Tests the parseCSV logic embedded in the import route.
 */

// Inline the parser to test without HTTP overhead
function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = Array.isArray(val) ? (val as string[]).join(";") : String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function splitCSVLine(line: string): string[] {
  const values: string[] = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === "," && !inQ) { values.push(cur); cur = ""; }
    else cur += ch;
  }
  values.push(cur);
  return values;
}

function parseCSV(text: string): Array<Record<string, string>> {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((line) => {
    const values = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = (values[i] ?? "").trim(); });
    return row;
  }).filter((r) => r["title"] || r["name"] || r["task"]);
}

describe("CSV parser — basic", () => {
  it("parses header + 1 row",        () => { const r = parseCSV("title,tags\nbuy milk,errands"); expect(r[0].title).toBe("buy milk"); });
  it("parses multiple rows",         () => { const r = parseCSV("title\na\nb\nc"); expect(r).toHaveLength(3); });
  it("handles CRLF line endings",    () => { const r = parseCSV("title\r\nbuy milk\r\n"); expect(r[0].title).toBe("buy milk"); });
  it("returns [] for header-only",   () => expect(parseCSV("title,tags")).toHaveLength(0));
  it("returns [] for empty string",  () => expect(parseCSV("")).toHaveLength(0));
  it("skips rows without title",     () => {
    const r = parseCSV("title,note\nbuy milk,\n,no title here\ncall dentist,");
    expect(r).toHaveLength(2);
  });
});

describe("CSV parser — quoted fields", () => {
  it("handles quoted commas",    () => {
    const r = parseCSV('title,note\n"task, with comma",note');
    expect(r[0].title).toBe("task, with comma");
  });
  it("handles escaped quotes",   () => {
    const r = parseCSV('title\n"say ""hello""!"');
    expect(r[0].title).toBe('say "hello"!');
  });
  it("handles quoted empty",     () => {
    const r = parseCSV('title,tags\n"buy milk",""');
    expect(r[0].tags).toBe("");
  });
});

describe("CSV escapeCSV", () => {
  it("escapes commas in strings",  () => expect(escapeCSV("a,b")).toBe('"a,b"'));
  it("escapes double quotes",      () => expect(escapeCSV('say "hi"')).toBe('"say ""hi"""'));
  it("joins arrays with semicolon",() => expect(escapeCSV(["work","urgent"])).toBe("work;urgent"));
  it("returns empty for null",     () => expect(escapeCSV(null)).toBe(""));
  it("plain strings unchanged",    () => expect(escapeCSV("buy milk")).toBe("buy milk"));
});

describe("CSV import — column aliases", () => {
  it("accepts 'name' column as title",   () => {
    const r = parseCSV("name,priority\nbuy milk,high");
    expect(r[0].name).toBe("buy milk");
  });
  it("accepts 'task' column as title",   () => {
    const r = parseCSV("task,due\nbuy milk,2026-01-01");
    expect(r[0].task).toBe("buy milk");
  });
});
