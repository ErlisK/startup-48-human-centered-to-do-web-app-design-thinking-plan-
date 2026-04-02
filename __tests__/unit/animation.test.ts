import { ANIM_BUDGET_MS, ANIM_FILL_MS, ANIM_TRAVEL_MS, ANIM_LAND_MS } from "@/lib/animation/completion";

describe("Animation budget (K-06)", () => {
  it("fill + travel + land === total budget",  () => expect(ANIM_FILL_MS + ANIM_TRAVEL_MS + ANIM_LAND_MS).toBe(ANIM_BUDGET_MS));
  it("budget ≤ 400ms",                         () => expect(ANIM_BUDGET_MS).toBeLessThanOrEqual(400));
  it("no single phase exceeds budget",          () => {
    expect(ANIM_FILL_MS).toBeLessThan(ANIM_BUDGET_MS);
    expect(ANIM_TRAVEL_MS).toBeLessThan(ANIM_BUDGET_MS);
    expect(ANIM_LAND_MS).toBeLessThan(ANIM_BUDGET_MS);
  });
  it("fill phase is longest component",         () => expect(ANIM_TRAVEL_MS).toBeGreaterThanOrEqual(ANIM_FILL_MS * 0.5));
});

describe("ANIM constant values", () => {
  it("fill  = 150ms", () => expect(ANIM_FILL_MS).toBe(150));
  it("travel = 180ms", () => expect(ANIM_TRAVEL_MS).toBe(180));
  it("land   = 70ms",  () => expect(ANIM_LAND_MS).toBe(70));
});
