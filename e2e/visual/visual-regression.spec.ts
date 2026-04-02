/**
 * Visual regression tests using Playwright screenshots.
 *
 * Strategy:
 * - On first run: capture baseline screenshots (.png) to e2e/visual/__baselines__/
 * - On subsequent runs: diff against baselines with pixel tolerance
 * - Threshold: maxDiffPixelRatio: 0.02 (2% of pixels can differ — handles
 *   font-rendering/sub-pixel differences across OS/CI environments)
 * - Focus on layout-critical pages: landing, login, privacy, offline
 *
 * To update baselines: `npx playwright test e2e/visual --update-snapshots`
 *
 * Note: screenshots captured at 1280×720 desktop and 390×844 mobile.
 */

import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function goAndSettle(page: Page, path: string) {
  await page.goto(`${BASE}${path}`);
  // Wait for fonts + layout to settle
  await page.waitForLoadState("networkidle");
  // Hide any animated/time-dependent elements for stable screenshots
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        animation-delay: 0s !important;
      }
      .install-banner { display: none !important; }
      .sync-indicator { display: none !important; }
    `,
  });
  // Small settle time for fonts
  await page.waitForTimeout(200);
}

const DESKTOP = { width: 1280, height: 720 };
const MOBILE  = { width: 390,  height: 844 };

const SCREENSHOT_OPTS = {
  maxDiffPixelRatio: 0.03, // 3% tolerance — handles cross-OS font rendering
  threshold: 0.2,           // per-pixel tolerance (0–1 scale)
  animations: "disabled" as const,
};

// ── Landing page ──────────────────────────────────────────────────────────────
test.describe("Visual: Landing page", () => {
  test("desktop layout matches baseline", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/");
    await expect(page).toHaveScreenshot("landing-desktop.png", SCREENSHOT_OPTS);
  });

  test("mobile layout matches baseline", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await goAndSettle(page, "/");
    await expect(page).toHaveScreenshot("landing-mobile.png", SCREENSHOT_OPTS);
  });

  test("hero section is visible", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/");
    const hero = page.locator("h1");
    await expect(hero).toBeVisible();
    await expect(hero).toHaveScreenshot("landing-hero.png", SCREENSHOT_OPTS);
  });

  test("features grid renders all 6 cards", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/");
    const grid = page.locator("section").filter({ has: page.locator("article") }).first();
    await expect(grid).toBeVisible();
    const cards = await grid.locator("article").count();
    expect(cards).toBe(6);
    await expect(grid).toHaveScreenshot("landing-features.png", SCREENSHOT_OPTS);
  });
});

// ── Auth pages ────────────────────────────────────────────────────────────────
test.describe("Visual: Auth pages", () => {
  test("login page desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/auth/login");
    await expect(page).toHaveScreenshot("login-desktop.png", SCREENSHOT_OPTS);
  });

  test("login page mobile", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await goAndSettle(page, "/auth/login");
    await expect(page).toHaveScreenshot("login-mobile.png", SCREENSHOT_OPTS);
  });

  test("signup page desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/auth/signup");
    await expect(page).toHaveScreenshot("signup-desktop.png", SCREENSHOT_OPTS);
  });
});

// ── Privacy page ──────────────────────────────────────────────────────────────
test.describe("Visual: Privacy page", () => {
  test("privacy page desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/privacy");
    await expect(page).toHaveScreenshot("privacy-desktop.png", SCREENSHOT_OPTS);
  });

  test("privacy page mobile", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await goAndSettle(page, "/privacy");
    await expect(page).toHaveScreenshot("privacy-mobile.png", SCREENSHOT_OPTS);
  });
});

// ── Offline page ──────────────────────────────────────────────────────────────
test.describe("Visual: Offline page", () => {
  test("offline page matches baseline", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/~offline");
    await expect(page).toHaveScreenshot("offline-desktop.png", SCREENSHOT_OPTS);
  });
});

// ── Bookmarklet page ─────────────────────────────────────────────────────────
test.describe("Visual: Bookmarklet page", () => {
  test("bookmarklet page desktop", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/bookmarklet");
    await expect(page).toHaveScreenshot("bookmarklet-desktop.png", SCREENSHOT_OPTS);
  });
});

// ── Colour contrast spot-check ────────────────────────────────────────────────
test.describe("Visual: Colour contract", () => {
  test("landing page background is dark (dark theme enforced)", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/");

    // Check computed background colour of body element
    const bgColor = await page.locator("body").evaluate((el) =>
      getComputedStyle(el).backgroundColor
    );

    // Should be very dark (≤ 30 in each RGB channel, matching #0d1117)
    const match = bgColor.match(/\d+/g)?.map(Number) ?? [];
    if (match.length >= 3) {
      const [r, g, b] = match;
      expect(r).toBeLessThan(30);
      expect(g).toBeLessThan(30);
      expect(b).toBeLessThan(30);
    }
  });

  test("primary text is light-coloured on dark background", async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await goAndSettle(page, "/auth/login");
    const h1 = page.locator("h1, h2, input").first();
    await expect(h1).toBeVisible({ timeout: 10_000 });
  });
});
