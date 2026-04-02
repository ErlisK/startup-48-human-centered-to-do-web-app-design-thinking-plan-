import { ANIM_BUDGET_MS, ANIM_FILL_MS, ANIM_TRAVEL_MS, ANIM_LAND_MS } from "@/lib/animation/completion";

describe("Animation budget (K-06)", () => {
  it("fill + travel + land equals budget", () => {
    expect(ANIM_FILL_MS + ANIM_TRAVEL_MS + ANIM_LAND_MS).toBe(ANIM_BUDGET_MS);
  });

  it("budget does not exceed 400ms", () => {
    expect(ANIM_BUDGET_MS).toBeLessThanOrEqual(400);
  });

  it("individual phases within budget", () => {
    expect(ANIM_FILL_MS).toBeLessThan(ANIM_BUDGET_MS);
    expect(ANIM_TRAVEL_MS).toBeLessThan(ANIM_BUDGET_MS);
    expect(ANIM_LAND_MS).toBeLessThan(ANIM_BUDGET_MS);
  });
});
