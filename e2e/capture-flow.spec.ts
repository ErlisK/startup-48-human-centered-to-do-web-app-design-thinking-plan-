/**
 * E2E: Task capture core flow
 * Tests: capture page, bookmarklet page, quick-capture modal
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Capture: Capture page UI", () => {
  test("capture page returns 200", async ({ page }) => {
    const resp = await page.goto(`${BASE}/capture`);
    expect(resp?.status()).toEqual(200);
  });

  test("capture page has a text input for task entry", async ({ page }) => {
    await page.goto(`${BASE}/capture`);
    // Input may have any type (text is default) or be textarea
    const input = page.locator("input, textarea").first();
    await expect(input).toBeVisible();
  });

  test("capture input is auto-focused (K-05)", async ({ page }) => {
    await page.goto(`${BASE}/capture`);
    await page.waitForTimeout(300); // allow autoFocus to take effect
    const input = page.locator("input, textarea").first();
    const focused = await input.evaluate((el) => document.activeElement === el);
    expect(focused).toBe(true);
  });

  test("capture page has a submit button", async ({ page }) => {
    await page.goto(`${BASE}/capture`);
    const btn = page.locator('button[type="submit"]');
    await expect(btn).toBeVisible();
  });

  test("typing in capture input updates value", async ({ page }) => {
    await page.goto(`${BASE}/capture`);
    const input = page.locator("input, textarea").first();
    await input.fill("Buy groceries tomorrow");
    const val = await input.inputValue();
    expect(val).toBe("Buy groceries tomorrow");
  });

  test("Escape key press does not crash the page", async ({ page }) => {
    await page.goto(`${BASE}/capture`);
    const input = page.locator("input, textarea").first();
    await input.fill("test task");
    await input.press("Escape");
    // Page should still be functional
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Capture: Bookmarklet page", () => {
  test("bookmarklet page returns 200", async ({ page }) => {
    const resp = await page.goto(`${BASE}/bookmarklet`);
    expect(resp?.status()).toEqual(200);
  });

  test("bookmarklet page has installation instructions", async ({ page }) => {
    await page.goto(`${BASE}/bookmarklet`);
    await expect(page.locator("h1, h2").first()).toBeVisible();
    const text = await page.textContent("body");
    expect(text?.toLowerCase()).toMatch(/bookmark|install|drag/i);
  });

  test("bookmarklet page has no duplicate main-content id", async ({ page }) => {
    await page.goto(`${BASE}/bookmarklet`);
    const count = await page.locator("[id='main-content']").count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test("bookmarklet page has skip link", async ({ page }) => {
    await page.goto(`${BASE}/bookmarklet`);
    await expect(page.locator('a[href="#main-content"]')).toBeAttached();
  });
});

test.describe("Capture: NLP labels & accessibility", () => {
  test("capture input has accessible label (aria-label or placeholder)", async ({ page }) => {
    await page.goto(`${BASE}/capture`);
    const input = page.locator("input, textarea").first();
    const ariaLabel  = await input.getAttribute("aria-label");
    const placeholder = await input.getAttribute("placeholder");
    const labelId    = await input.getAttribute("aria-labelledby");
    expect(ariaLabel || placeholder || labelId).toBeTruthy();
  });
});

test.describe("Capture: Quick capture modal", () => {
  test("Ctrl+K fires on the page without throwing", async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.keyboard.press("Control+k");
    await page.waitForTimeout(300);
    await expect(page.locator("body")).toBeVisible();
  });
});
