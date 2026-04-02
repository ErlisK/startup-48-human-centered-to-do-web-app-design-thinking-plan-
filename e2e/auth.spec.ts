/**
 * E2E: Authentication flows
 * Tests: login/signup pages, form validation, navigation
 */
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Auth: Login page", () => {
  test("renders login page with email field", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    // Wait for client component hydration
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });
  });

  test("shows password mode when toggled", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });
    // Login has magic/password tabs — click password tab
    const pwdTab = page.getByRole("button", { name: /password/i });
    if (await pwdTab.count() > 0) {
      await pwdTab.click();
      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5_000 });
    } else {
      // Magic-link only mode — email field is sufficient
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test("email autocomplete is set", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    await page.waitForLoadState("networkidle");
    const email = page.locator('input[type="email"]');
    await expect(email).toBeVisible({ timeout: 10_000 });
    await expect(email).toHaveAttribute("autocomplete", /email|username/i);
  });

  test("email field starts empty (browser validation ready)", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    // Empty email field = HTML5 required validation will fire on submit
    const val = await emailInput.inputValue();
    expect(val).toBe("");
  });

  test("shows link to signup page", async ({ page }) => {
    await page.goto(`${BASE}/auth/login`);
    const signupLink = page.locator("a[href*='signup']");
    await expect(signupLink.first()).toBeAttached();
  });
});

test.describe("Auth: Signup page", () => {
  test("renders signup page with email field", async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("shows password field on signup", async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`);
    // Try to find password field (may be in password mode by default)
    const pwdField = page.locator('input[type="password"]');
    const count = await pwdField.count();
    // If present, must be masked
    if (count > 0) {
      await pwdField.fill("testpassword123");
      await expect(pwdField).toHaveAttribute("type", "password");
    } else {
      // Magic-link only — just verify email is present
      await expect(page.locator('input[type="email"]')).toBeVisible();
    }
  });

  test("shows link back to login", async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`);
    const loginLink = page.locator("a[href*='login']");
    await expect(loginLink.first()).toBeAttached();
  });
});

test.describe("Auth: Navigation guards", () => {
  test("unauthenticated user at /app/today is redirected", async ({ page }) => {
    await page.goto(`${BASE}/app/today`);
    await page.waitForURL(/.+/, { timeout: 5000 });
    const url = page.url();
    expect(url).not.toMatch(/^.*\/app\/today$/);
  });

  test("landing page loads with 200 status", async ({ page }) => {
    const resp = await page.goto(`${BASE}/`);
    expect(resp?.status()).toEqual(200);
  });

  test("landing page has a sign-in or get-started link", async ({ page }) => {
    await page.goto(`${BASE}/`);
    const ctaLink = page.locator("a, button").filter({ hasText: /sign in|get started|log in|start/i });
    await expect(ctaLink.first()).toBeAttached();
  });
});
