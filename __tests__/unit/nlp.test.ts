import { parseNlp } from "@/lib/nlp/parse";

describe("parseNlp — priority", () => {
  it("! → high",    () => expect(parseNlp("call dentist !").priority).toBe("high"));
  it("!! → medium", () => expect(parseNlp("call dentist !!").priority).toBe("medium"));
  it("no bang → null", () => expect(parseNlp("buy milk").priority).toBeNull());
  it("strips ! from cleanTitle", () => expect(parseNlp("task !").cleanTitle).toBe("task"));
});

describe("parseNlp — tags", () => {
  it("extracts single tag",    () => expect(parseNlp("review PR #work").tags).toContain("work"));
  it("extracts multiple tags", () => {
    const r = parseNlp("fix PR #work #urgent");
    expect(r.tags).toContain("work");
    expect(r.tags).toContain("urgent");
  });
  it("tags not in cleanTitle", () => expect(parseNlp("fix #work").cleanTitle).not.toContain("#work"));
});

describe("parseNlp — duration", () => {
  it("~30m → 30",     () => expect(parseNlp("standup ~30m").durationMinutes).toBe(30));
  it("~2h → 120",     () => expect(parseNlp("deep work ~2h").durationMinutes).toBe(120));
  it("no duration → null", () => expect(parseNlp("buy milk").durationMinutes).toBeNull());
});

describe("parseNlp — date", () => {
  it("@friday → date string",  () => expect(parseNlp("submit @friday").date).not.toBeNull());
  it("@tomorrow → date",       () => expect(parseNlp("call @tomorrow").date).not.toBeNull());
  it("@today → date",          () => expect(parseNlp("standup @today").date).not.toBeNull());
  it("nonsense @xyzfoobarbaz123 → unparsed token", () =>
    expect(parseNlp("task @xyzfoobarbaz123").unparsedTokens.length).toBeGreaterThan(0));
  it("no date → null", () => expect(parseNlp("buy milk").date).toBeNull());
});

describe("parseNlp — combined", () => {
  it("all shorthand together", () => {
    const r = parseNlp("write spec @fri ! #work ~2h");
    expect(r.cleanTitle).toMatch(/write spec/);
    expect(r.date).not.toBeNull();
    expect(r.priority).toBe("high");
    expect(r.tags).toContain("work");
    expect(r.durationMinutes).toBe(120);
    expect(r.unparsedTokens).toHaveLength(0);
  });
  it("empty input → safe defaults", () => {
    const r = parseNlp("");
    expect(r.cleanTitle).toBe("");
    expect(r.priority).toBeNull();
    expect(r.tags).toHaveLength(0);
    expect(r.date).toBeNull();
    expect(r.durationMinutes).toBeNull();
  });
  it("whitespace only → empty cleanTitle", () => expect(parseNlp("   ").cleanTitle).toBe(""));
});
