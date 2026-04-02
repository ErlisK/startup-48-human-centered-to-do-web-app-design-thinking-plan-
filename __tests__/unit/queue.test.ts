/**
 * Offline queue — behavioural tests.
 * We test the module exports and business logic only;
 * actual IndexedDB interactions are tested via E2E.
 */

describe("Offline queue — module contract", () => {
  it("exports enqueue function",        async () => {
    const mod = await import("@/lib/offline/queue");
    expect(typeof mod.enqueue).toBe("function");
  });
  it("exports flushQueue function",     async () => {
    const mod = await import("@/lib/offline/queue");
    expect(typeof mod.flushQueue).toBe("function");
  });
  it("exports getPendingCount function", async () => {
    const mod = await import("@/lib/offline/queue");
    expect(typeof mod.getPendingCount).toBe("function");
  });
});
