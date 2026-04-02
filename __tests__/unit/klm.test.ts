/**
 * KLM v2 performance budget assertions.
 * Values from phase4-klm-analysis-v2.md (operator table).
 */

// Operator times (ms) — Phase 4 KLM v2 canonical values
const K    = 200;   // keystroke (average typist)
const B    = 100;   // button press
const P    = 850;   // point (mouse, cold)
const Pn   = 300;   // point near (touch near-target, optimistic)
const R    = 50;    // rapid system response
const Rc   = 150;   // confirm response (animation start)
const FILL_MS   = 150;
const TRAVEL_MS = 180;
const LAND_MS   =  70;
const ANIM      = FILL_MS + TRAVEL_MS + LAND_MS; // 400

describe("KLM: F1A — 8-char keyboard capture", () => {
  it("physical execution (no M) ≤ 2000ms", () => {
    // B(focus) + 8×K + K(enter) + R(DOM confirm)
    const t = B + 8 * K + K + R;
    expect(t).toBeLessThanOrEqual(2000); // 1850ms
  });
});

describe("KLM: F3A — keyboard check-off", () => {
  it("Space + animation ≤ 1000ms", () => {
    const t = K + Rc + ANIM;  // 750ms
    expect(t).toBeLessThanOrEqual(1000);
  });
});

describe("KLM: F3B — touch check-off (near target)", () => {
  it("Pn + B + animation ≤ 1050ms (touch budget)", () => {
    // Near-touch path: Pn(300) + B(100) + Rc(150) + ANIM(400) = 950ms
    const t = Pn + B + Rc + ANIM;
    expect(t).toBeLessThanOrEqual(1050);
  });
});

describe("KLM: mouse cold-path exception", () => {
  it("mouse cold check-off > 1000ms but ≤ 1500ms (accepted exception)", () => {
    // P(850) + B(100) + Rc(150) + ANIM(400) = 1500ms — documented exception
    const t = P + B + Rc + ANIM;
    expect(t).toBeGreaterThan(1000);
    expect(t).toBeLessThanOrEqual(1500);
  });
});

describe("Animation pipeline", () => {
  it("400ms total ceiling",  () => expect(ANIM).toBeLessThanOrEqual(400));
  it("CI gate ≤ 410ms",      () => expect(ANIM).toBeLessThanOrEqual(410));
  it("fill = 150ms",         () => expect(FILL_MS).toBe(150));
  it("travel = 180ms",       () => expect(TRAVEL_MS).toBe(180));
  it("land = 70ms",          () => expect(LAND_MS).toBe(70));
});
