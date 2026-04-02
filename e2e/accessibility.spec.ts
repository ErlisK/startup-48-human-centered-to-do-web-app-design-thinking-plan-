import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = [
  { name: "landing",    url: "/" },
  { name: "signup",     url: "/auth/signup" },
  { name: "login",      url: "/auth/login" },
  { name: "bookmarklet",url: "/bookmarklet" },
];

for (const { name, url } of pages) {
  test(`${name} page — no critical WCAG AA violations`, async ({ page }) => {
    await page.goto(url);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude("script, style, noscript")
      .analyze();
    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    if (critical.length > 0) {
      console.log("Violations:", critical.map((v) => `${v.id}: ${v.description}`).join("\n"));
    }
    expect(critical).toHaveLength(0);
  });
}
