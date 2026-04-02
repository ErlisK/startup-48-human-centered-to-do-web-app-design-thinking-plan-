import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("tasks that don't pile up", { exact: false })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("link", { name: /start for free/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
  });

  test("links to signup and login", async ({ page }) => {
    await page.goto("/");
    const signupLink = page.getByRole("link", { name: /get started free/i }).first();
    await expect(signupLink).toHaveAttribute("href", "/auth/signup");
  });

  test("feature cards visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Instant capture")).toBeVisible();
    await expect(page.getByText("Done Wall")).toBeVisible();
  });
});

test.describe("Auth pages", () => {
  test("signup page renders with magic/password toggle", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByText("Create account")).toBeVisible();
    await expect(page.getByRole("button", { name: /magic link/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /password/i }).first()).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText("Sign in")).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test("signup shows password field when password mode selected", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: /^password$/i }).click();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  });

  test("login shows forgot password only in password mode", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: /^password$/i }).click();
    await expect(page.getByText(/forgot password/i)).toBeVisible();
  });
});

test.describe("Bookmarklet page", () => {
  test("renders drag button and code", async ({ page }) => {
    await page.goto("/bookmarklet");
    await expect(page.getByText("Capture from anywhere")).toBeVisible();
    await expect(page.getByText("Save to focus")).toBeVisible();
    await expect(page.getByRole("textbox")).toBeVisible();
  });

  test("bookmarklet textarea has javascript: content", async ({ page }) => {
    await page.goto("/bookmarklet");
    const ta = page.getByRole("textbox");
    const value = await ta.inputValue();
    expect(value).toMatch(/^javascript:/);
    expect(value).toContain("focus_capture");
  });
});

test.describe("PWA", () => {
  test("manifest.json accessible with correct shape", async ({ page }) => {
    const r = await page.goto("/manifest.json");
    expect(r?.status()).toBe(200);
    const json = await r?.json();
    expect(json.name).toBeTruthy();
    expect(json.display).toBe("standalone");
    expect(json.icons).toBeInstanceOf(Array);
    expect(json.icons.length).toBeGreaterThan(0);
  });

  test("start_url defined", async ({ page }) => {
    const r = await page.goto("/manifest.json");
    const json = await r?.json();
    expect(json.start_url).toBeTruthy();
  });
});

test.describe("Security headers", () => {
  test("X-Frame-Options is DENY", async ({ page }) => {
    const r = await page.goto("/");
    expect(r?.headers()["x-frame-options"]).toBe("DENY");
  });
  test("X-Content-Type-Options is nosniff", async ({ page }) => {
    const r = await page.goto("/");
    expect(r?.headers()["x-content-type-options"]).toBe("nosniff");
  });
});
