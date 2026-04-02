/**
 * Security unit tests — pure functions only (no Next.js globals needed).
 */

import { sanitizeText, sanitizePriority, sanitizeDate, sanitizeTags } from "@/lib/security/sanitize";
import { getRequestIp, getUserAgent } from "@/lib/security/audit";

describe("sanitizeText", () => {
  it("trims whitespace",              () => expect(sanitizeText("  buy milk  ")).toBe("buy milk"));
  it("strips HTML tags",              () => expect(sanitizeText("<b>task</b>")).toBe("task"));
  it("strips script tags",            () => expect(sanitizeText("<script>alert(1)</script>buy milk")).toBe("buy milk"));
  it("strips javascript: protocol",   () => expect(sanitizeText("javascript:alert(1)")).toBe("alert(1)"));
  it("strips data URI",               () => expect(sanitizeText("data:text/htmlfoo")).toBe("foo"));
  it("truncates to maxLength",        () => expect(sanitizeText("a".repeat(600), 500)).toHaveLength(500));
  it("allows normal task text",       () => expect(sanitizeText("Buy milk at 9am tomorrow")).toBe("Buy milk at 9am tomorrow"));
  it("returns empty string for empty",() => expect(sanitizeText("")).toBe(""));
});

describe("sanitizePriority", () => {
  it("accepts 1",                   () => expect(sanitizePriority(1)).toBe(1));
  it("accepts 4",                   () => expect(sanitizePriority(4)).toBe(4));
  it("rejects 0",                   () => expect(sanitizePriority(0)).toBeNull());
  it("rejects 5",                   () => expect(sanitizePriority(5)).toBeNull());
  it("rejects non-numeric string",  () => expect(sanitizePriority("high")).toBeNull());
  it("rejects NaN",                 () => expect(sanitizePriority(NaN)).toBeNull());
  it("rounds 1.9 to 2",            () => expect(sanitizePriority(1.9)).toBe(2));
  it("accepts '2' string number",   () => expect(sanitizePriority("2")).toBe(2));
});

describe("sanitizeDate", () => {
  it("accepts valid ISO date",      () => {
    const result = sanitizeDate("2026-04-01T00:00:00.000Z");
    expect(result).toBeTruthy();
    expect(new Date(result!).getFullYear()).toBe(2026);
  });
  it("rejects invalid string",      () => expect(sanitizeDate("not-a-date")).toBeNull());
  it("returns null for null",       () => expect(sanitizeDate(null)).toBeNull());
  it("returns null for empty",      () => expect(sanitizeDate("")).toBeNull());
  it("accepts date-only string",    () => expect(sanitizeDate("2026-01-01")).toBeTruthy());
});

describe("sanitizeTags", () => {
  it("accepts string array",        () => expect(sanitizeTags(["work","urgent"])).toEqual(["work","urgent"]));
  it("rejects non-array",           () => expect(sanitizeTags("work")).toEqual([]));
  it("strips HTML in tags",         () => expect(sanitizeTags(["<b>work</b>"])).toEqual(["work"]));
  it("limits to 20 tags",           () => {
    const many = Array.from({ length: 25 }, (_, i) => `tag${i}`);
    expect(sanitizeTags(many)).toHaveLength(20);
  });
  it("truncates tag to 50 chars",   () => expect(sanitizeTags(["a".repeat(60)])[0]).toHaveLength(50));
  it("filters empty strings",       () => expect(sanitizeTags(["", "work", ""])).toEqual(["work"]));
  it("returns empty for empty array",() => expect(sanitizeTags([])).toEqual([]));
});

describe("rate-limit: sliding window logic", () => {
  function slidingWindow(timestamps: number[], now: number, windowMs: number, max: number) {
    const fresh = timestamps.filter((t) => now - t < windowMs);
    fresh.push(now);
    return { ok: fresh.length <= max, count: fresh.length };
  }

  it("allows under limit",           () => {
    const ts = [Date.now() - 1000, Date.now() - 2000];
    expect(slidingWindow(ts, Date.now(), 60_000, 5).ok).toBe(true);
  });
  it("blocks over limit",            () => {
    const now = Date.now();
    const ts  = [now - 1000, now - 2000, now - 3000, now - 4000, now - 5000];
    expect(slidingWindow(ts, now, 60_000, 5).ok).toBe(false);
  });
  it("ignores expired timestamps",   () => {
    const now = Date.now();
    const ts  = [now - 61_000, now - 62_000, now - 70_000];
    expect(slidingWindow(ts, now, 60_000, 5).ok).toBe(true);
  });
  it("counts correctly",             () => {
    const now = Date.now();
    const ts  = [now - 1000, now - 2000];
    expect(slidingWindow(ts, now, 60_000, 10).count).toBe(3);
  });
});

describe("audit: request helpers", () => {
  const h = (obj: Record<string, string>) => new Headers(obj);

  it("reads x-forwarded-for (first IP)", () => expect(getRequestIp(h({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4"));
  it("reads x-real-ip",                  () => expect(getRequestIp(h({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9"));
  it("returns unknown if no IP header",  () => expect(getRequestIp(h({}))).toBe("unknown"));
  it("reads user-agent",                 () => expect(getUserAgent(h({ "user-agent": "TestBrowser/1.0" }))).toBe("TestBrowser/1.0"));
  it("truncates UA to 200 chars",        () => expect(getUserAgent(h({ "user-agent": "A".repeat(300) }))).toHaveLength(200));
  it("returns unknown if no UA",         () => expect(getUserAgent(h({}))).toBe("unknown"));
});
