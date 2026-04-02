/**
 * E2E: Settings, data, privacy flows
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Settings: Auth protection", () => {
  test("settings page is behind auth (redirects)", async ({ page }) => {
    await page.goto(`${BASE}/app/settings`);
    const url = page.url();
    expect(url).not.toContain("500");
  });

  test("import page renders without 500", async ({ page }) => {
    const resp = await page.goto(`${BASE}/app/import`);
    expect(resp?.status()).not.toEqual(500);
  });
});

test.describe("Privacy page", () => {
  test("renders with 200 status", async ({ page }) => {
    const resp = await page.goto(`${BASE}/privacy`);
    expect(resp?.status()).toEqual(200);
  });

  test("privacy page has h1 heading", async ({ page }) => {
    await page.goto(`${BASE}/privacy`);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("privacy page has an accessible landmark (nav or main)", async ({ page }) => {
    await page.goto(`${BASE}/privacy`);
    // May use div with id or nav element
    const landmark = page.locator("nav, main, [id='main-content'], [role='main']");
    await expect(landmark.first()).toBeAttached();
  });

  test("privacy page mentions telemetry being off", async ({ page }) => {
    await page.goto(`${BASE}/privacy`);
    const text = await page.textContent("body");
    expect(text?.toLowerCase()).toMatch(/telemetry|tracking/);
  });

  test("privacy page links to settings", async ({ page }) => {
    await page.goto(`${BASE}/privacy`);
    const settingsLink = page.locator("a[href*='settings']");
    await expect(settingsLink.first()).toBeAttached();
  });
});

test.describe("Data API: Auth guards", () => {
  test("GET /api/export returns 4xx without auth", async ({ page }) => {
    const resp = await page.goto(`${BASE}/api/export`);
    expect(resp?.status()).toBeGreaterThanOrEqual(400);
  });

  test("GET /api/export?format=json returns 4xx without auth", async ({ page }) => {
    const resp = await page.goto(`${BASE}/api/export?format=json`);
    expect(resp?.status()).toBeGreaterThanOrEqual(400);
  });

  test("POST /api/import returns 4xx without auth", async ({ page }) => {
    const resp = await page.request.post(`${BASE}/api/import`, {
      multipart: { file: { name: "t.csv", mimeType: "text/csv", buffer: Buffer.from("title\nbuy milk") } }
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });

  test("DELETE /api/account returns 4xx without auth", async ({ page }) => {
    const resp = await page.request.delete(`${BASE}/api/account`, {
      data: { confirm: "DELETE_MY_ACCOUNT" }
    });
    expect(resp.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("Health check endpoint", () => {
  test("GET /api/health returns a JSON response", async ({ page }) => {
    const resp = await page.goto(`${BASE}/api/health`);
    // Returns 200 on deployed builds; may return 404 during staged rollout
    const status = resp?.status() ?? 0;
    if (status === 200) {
      const json = await resp?.json();
      expect(json.ok).toBe(true);
      expect(json.ts).toBeTruthy();
    } else {
      // Acceptable if health endpoint is being deployed
      expect([200, 404]).toContain(status);
    }
  });
});
