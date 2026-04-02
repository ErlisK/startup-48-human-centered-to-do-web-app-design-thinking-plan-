import { test, expect } from "@playwright/test";

test.describe("Capture flow (KLM F1A: ≤2s physical exec)", () => {
  test.beforeEach(async ({ page }) => {
    // For E2E we test against the landing page structure without auth
    await page.goto("/");
  });

  test("landing page renders CTA", async ({ page }) => {
    await expect(page.getByText("Get early access")).toBeVisible();
    await expect(page.getByText("✦ focus")).toBeVisible();
  });

  test("landing page has correct meta", async ({ page }) => {
    await expect(page).toHaveTitle(/focus/);
  });
});

test.describe("PWA manifest", () => {
  test("manifest is accessible", async ({ page }) => {
    const response = await page.goto("/manifest.json");
    expect(response?.status()).toBe(200);
    const json = await response?.json();
    expect(json.name).toContain("focus");
    expect(json.display).toBe("standalone");
  });
});

test.describe("Security headers", () => {
  test("X-Frame-Options is set", async ({ page }) => {
    const response = await page.goto("/");
    const headers = response?.headers();
    expect(headers?.["x-frame-options"]).toBe("DENY");
    expect(headers?.["x-content-type-options"]).toBe("nosniff");
  });
});
