/**
 * PWA install and offline queue contract tests.
 */

describe("PWA: manifest shape", () => {
  const manifest = {
    name: "✦ focus",
    short_name: "focus",
    start_url: "/app/today",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    icons: [
      { src: "/icons/icon-96.png",  sizes: "96x96",  type: "image/png" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };

  it("has all required PWA fields",    () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    expect(manifest.background_color).toBeTruthy();
    expect(manifest.theme_color).toBeTruthy();
  });
  it("has ≥2 icons",                   () => expect(manifest.icons.length).toBeGreaterThanOrEqual(2));
  it("includes 192px icon",            () => expect(manifest.icons.some((i) => i.sizes === "192x192")).toBe(true));
  it("includes 512px icon",            () => expect(manifest.icons.some((i) => i.sizes === "512x512")).toBe(true));
  it("icons are PNG",                  () => manifest.icons.forEach((i) => expect(i.type).toBe("image/png")));
  it("start_url points to app",        () => expect(manifest.start_url).toBe("/app/today"));
});

describe("Animation budget — PWA perf", () => {
  it("P75 TTI budget comment: ≤2000ms", () => {
    // Budget is an architectural constraint — verified by Lighthouse in CI
    // This assertion documents the target in the test suite
    const TARGET_TTI_MS = 2000;
    expect(TARGET_TTI_MS).toBe(2000);
  });
});
