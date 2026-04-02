import { parseNlp } from "@/lib/nlp/parse";

describe("parseNlp", () => {
  it("extracts priority !", () => {
    const r = parseNlp("call dentist !");
    expect(r.priority).toBe("high");
    expect(r.cleanTitle).toBe("call dentist");
  });

  it("extracts tags", () => {
    const r = parseNlp("review PR #work #urgent");
    expect(r.tags).toContain("work");
    expect(r.tags).toContain("urgent");
  });

  it("extracts duration ~30m", () => {
    const r = parseNlp("standup ~30m");
    expect(r.durationMinutes).toBe(30);
  });

  it("extracts duration ~2h", () => {
    const r = parseNlp("deep work ~2h");
    expect(r.durationMinutes).toBe(120);
  });

  it("parses @fri as a future date", () => {
    const r = parseNlp("submit report @fri");
    expect(r.date).not.toBeNull();
    expect(r.unparsedTokens).toHaveLength(0);
  });

  it("marks unparsed tokens (HV-018)", () => {
    const r = parseNlp("task @nexttuesafternoonn");
    expect(r.unparsedTokens.length).toBeGreaterThan(0);
    expect(r.date).toBeNull();
  });

  it("handles empty input", () => {
    const r = parseNlp("");
    expect(r.cleanTitle).toBe("");
    expect(r.priority).toBeNull();
  });

  it("handles complex input with all shorthand", () => {
    const r = parseNlp("write spec @fri ! #work ~2h");
    expect(r.cleanTitle).toMatch(/write spec/);
    expect(r.date).not.toBeNull();
    expect(r.priority).toBe("high");
    expect(r.tags).toContain("work");
    expect(r.durationMinutes).toBe(120);
  });
});
