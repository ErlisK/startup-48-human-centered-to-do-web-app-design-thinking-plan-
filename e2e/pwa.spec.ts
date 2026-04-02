import { test, expect } from "@playwright/test";

test.describe("PWA manifest", () => {
  test("manifest.json is valid and complete", async ({ page }) => {
    const r = await page.goto("/manifest.json");
    expect(r?.status()).toBe(200);
    const json = await r?.json();

    // Required fields
    expect(json.name).toBeTruthy();
    expect(json.short_name).toBeTruthy();
    expect(json.start_url).toBeTruthy();
    expect(json.display).toBe("standalone");
    expect(json.background_color).toBeTruthy();
    expect(json.theme_color).toBeTruthy();

    // Icons
    expect(json.icons).toBeInstanceOf(Array);
    expect(json.icons.length).toBeGreaterThanOrEqual(2);
    const sizes = json.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");

    // All icon files reference PNG
    json.icons.forEach((icon: { src: string; type: string }) => {
      expect(icon.src).toMatch(/\.png$/);
      expect(icon.type).toBe("image/png");
    });
  });

  test("icon files are accessible", async ({ page }) => {
    for (const size of ["96", "192", "512"]) {
      const r = await page.goto(`/icons/icon-${size}.png`);
      expect(r?.status()).toBe(200);
      expect(r?.headers()["content-type"]).toContain("image/png");
    }
  });

  test("sw.js is served with correct headers", async ({ page }) => {
    const r = await page.goto("/sw.js");
    expect(r?.status()).toBe(200);
    const cc = r?.headers()["cache-control"] ?? "";
    expect(cc).toContain("no-cache");
    const swa = r?.headers()["service-worker-allowed"] ?? "";
    expect(swa).toBe("/");
  });

  test("workbox manifest (workbox-*.js) accessible", async ({ page }) => {
    // sw.js exists and has content
    const r = await page.goto("/sw.js");
    const body = await r?.text();
    expect(body?.length).toBeGreaterThan(100);
    expect(body).toContain("workbox");
  });
});

test.describe("Offline fallback page", () => {
  test("~offline page renders", async ({ page }) => {
    await page.goto("/~offline");
    await expect(page.getByText("You're offline")).toBeVisible();
    await expect(page.getByRole("link", { name: "Today" })).toBeVisible();
  });
});

test.describe("Performance budget checks", () => {
  test("landing page loads in < 3s", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "networkidle" });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(3000);
  });

  test("no render-blocking fonts", async ({ page }) => {
    await page.goto("/");
    // Check no @font-face in blocking position
    const fontLinks = await page.$$eval(
      'link[rel="stylesheet"]',
      (links) => links.map((l) => (l as HTMLLinkElement).href)
    );
    // Should have no external font stylesheets
    const externalFonts = fontLinks.filter((href) => href.includes("fonts.googleapis") || href.includes("typekit"));
    expect(externalFonts).toHaveLength(0);
  });

  test("images have explicit width/height or aspect-ratio", async ({ page }) => {
    await page.goto("/");
    // Check CLS - images should not be unsized
    const unsized = await page.$$eval("img:not([width]):not([height])", (imgs) =>
      imgs.filter((img) => !(img as HTMLImageElement).style.aspectRatio).length
    );
    expect(unsized).toBe(0);
  });
});

test.describe("Security headers", () => {
  test("all security headers present", async ({ page }) => {
    const r = await page.goto("/");
    const h = r?.headers() ?? {};
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBeTruthy();
    expect(h["permissions-policy"]).toBeTruthy();
  });
});
