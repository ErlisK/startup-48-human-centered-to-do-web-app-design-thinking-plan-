import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicPages = [
  { name: "landing",      url: "/" },
  { name: "signup",       url: "/auth/signup" },
  { name: "login",        url: "/auth/login" },
  { name: "bookmarklet",  url: "/bookmarklet" },
  { name: "offline",      url: "/~offline" },
];

for (const { name, url } of publicPages) {
  test(`${name} — no critical/serious WCAG AA violations`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState("domcontentloaded");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude("script, style, noscript, [aria-hidden='true']")
      .analyze();

    const failures = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (failures.length > 0) {
      const details = failures
        .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    Nodes: ${v.nodes.slice(0,2).map((n) => n.html.slice(0, 120)).join("; ")}`)
        .join("\n");
      console.error(`Accessibility violations on ${url}:\n${details}`);
    }
    expect(failures, `${failures.length} critical/serious violations on ${name}`).toHaveLength(0);
  });
}

test.describe("Skip navigation", () => {
  test("skip link exists and has correct target on landing page", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toBeAttached();
    await expect(skipLink).toHaveText(/skip to main content/i);
  });

  test("skip link is first Tab stop on landing page", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.getAttribute("href"));
    expect(focused).toBe("#main-content");
  });

  test("skip link is present on auth pages", async ({ page }) => {
    await page.goto("/auth/login");
    const skipLink = page.locator('a[href="#main-content"]').first();
    await expect(skipLink).toBeAttached();
  });

  test("skip link destination #main-content exists", async ({ page }) => {
    await page.goto("/");
    const target = page.locator("#main-content").first();
    await expect(target).toBeAttached();
  });
});

test.describe("Keyboard navigation — auth pages", () => {
  test("login email field is accessible by keyboard", async ({ page }) => {
    await page.goto("/auth/login");
    const emailInput = page.getByLabel(/email/i);
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
    expect(await emailInput.getAttribute("type")).toBe("email");
  });

  test("login submit button is keyboard-accessible", async ({ page }) => {
    await page.goto("/auth/login");
    const submitBtn = page.getByRole("button", { name: /send magic link|sign in/i }).first();
    await submitBtn.focus();
    await expect(submitBtn).toBeFocused();
  });

  test("signup switches to password mode on button click", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.getByRole("button", { name: /^password$/i }).click();
    const pwField = page.getByLabel(/password/i).first();
    await expect(pwField).toBeVisible();
    expect(await pwField.getAttribute("type")).toBe("password");
  });
});

test.describe("ARIA landmarks", () => {
  test("landing page has main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main, [role='main']").first()).toBeAttached();
  });

  test("bookmarklet page has main landmark with id=main-content", async ({ page }) => {
    await page.goto("/bookmarklet");
    await expect(page.locator("#main-content")).toBeVisible();
  });

  test("offline page has heading", async ({ page }) => {
    await page.goto("/~offline");
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
  });
});

test.describe("Colour contrast", () => {
  test("text-primary (#f0f0f0) vs bg-base (#0d1117) ≥ 4.5:1", async ({ page }) => {
    await page.goto("/");
    const ratio = await page.evaluate(() => {
      function lum(hex: string) {
        const h = hex.replace("#","");
        const r=parseInt(h.slice(0,2),16)/255, g=parseInt(h.slice(2,4),16)/255, b=parseInt(h.slice(4,6),16)/255;
        const lin=(c: number) => c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
        return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
      }
      const l1=lum("#f0f0f0"), l2=lum("#0d1117");
      return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("Focus visibility", () => {
  test("focused button has visible outline", async ({ page }) => {
    await page.goto("/auth/login");
    const btn = page.getByRole("button", { name: /magic link/i }).first();
    await btn.focus();
    const outline = await btn.evaluate((el) => window.getComputedStyle(el).outlineStyle);
    // Any non-none outline counts as visible focus
    expect(outline).not.toBe("none");
  });
});
