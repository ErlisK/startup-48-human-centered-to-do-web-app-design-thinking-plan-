# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: accessibility.spec.ts >> bookmarklet — no critical/serious WCAG AA violations
- Location: e2e/accessibility.spec.ts:13:7

# Error details

```
Error: 1 critical/serious violations on bookmarklet

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  [{"description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds", "help": "Elements must meet minimum color contrast ratio thresholds", "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright", "id": "color-contrast", "impact": "serious", "nodes": [{"all": [], "any": [{"data": {"bgColor": "#2e86de", "contrastRatio": 3.76, "expectedContrastRatio": "4.5:1", "fgColor": "#ffffff", "fontSize": "11.3pt (15px)", "fontWeight": "bold", "messageKey": null}, "id": "color-contrast", "impact": "serious", "message": "Element has insufficient color contrast of 3.76 (foreground color: #ffffff, background color: #2e86de, font size: 11.3pt (15px), font weight: bold). Expected contrast ratio of 4.5:1", "relatedNodes": [{"html": "<a href=\"javascript:throw new...\" draggable=\"true\" style=\"display:inline-flex;...\" aria-label=\"Drag to bookmarks ba...\">", "target": ["a[draggable=\"true\"]"]}]}], "failureSummary": "Fix any of the following:
  Element has insufficient color contrast of 3.76 (foreground color: #ffffff, background color: #2e86de, font size: 11.3pt (15px), font weight: bold). Expected contrast ratio of 4.5:1", "html": "<a href=\"javascript:throw new...\" draggable=\"true\" style=\"display:inline-flex;...\" aria-label=\"Drag to bookmarks ba...\">", "impact": "serious", "none": [], "target": ["a[draggable=\"true\"]"]}], "tags": ["cat.color", "wcag2aa", "wcag143", "TTv5", "TT13.c", "EN-301-549", "EN-9.1.4.3", "ACT", "RGAAv4", "RGAA-3.2.1"]}]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - navigation "Site navigation" [ref=e5]:
      - link "focus — go to home" [ref=e6] [cursor=pointer]:
        - /url: /
        - text: ✦ focus
    - main [ref=e7]:
      - heading "Capture from anywhere" [level=1] [ref=e8]
      - paragraph [ref=e9]: Drag the button to your bookmarks bar. Click it on any page to save it as a task instantly.
      - region "Bookmarklet install" [ref=e10]:
        - generic [ref=e11]:
          - link "Drag to bookmarks bar to install Save to focus bookmarklet" [ref=e12]:
            - /url: "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')"
            - text: ✦ Save to focus
          - paragraph [ref=e13]:
            - text: ← Drag to bookmarks bar
            - generic [ref=e14]: "Show bar: Ctrl+Shift+B / ⌘+Shift+B"
      - region "Manual install" [ref=e15]:
        - heading "Manual install" [level=2] [ref=e16]
        - list [ref=e17]:
          - listitem [ref=e18]:
            - text: Right-click bookmarks bar →
            - strong [ref=e19]: Add page…
          - listitem [ref=e20]:
            - text: "Name:"
            - strong [ref=e21]: Save to focus
          - listitem [ref=e22]: "URL: paste the code below"
        - generic [ref=e23]: Bookmarklet code — click to select all
        - textbox "Bookmarklet code — click to select all" [ref=e24]: "javascript:(function(){var u=encodeURIComponent(location.href);var t=encodeURIComponent(document.title);window.open('http://localhost:3000/capture?url='+u+'&title='+t,'focus_capture','width=420,height=220,top='+((screen.height-220)/2)+',left='+((screen.width-420)/2));})();"
      - region "Already in the app?" [ref=e25]:
        - heading "Already in the app?" [level=2] [ref=e26]
        - paragraph [ref=e27]: Press ⌘K or Ctrl+K anywhere to open instant capture.
  - button "Open Next.js Dev Tools" [ref=e33] [cursor=pointer]:
    - img [ref=e34]
  - alert [ref=e37]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | 
  4   | const publicPages = [
  5   |   { name: "landing",      url: "/" },
  6   |   { name: "signup",       url: "/auth/signup" },
  7   |   { name: "login",        url: "/auth/login" },
  8   |   { name: "bookmarklet",  url: "/bookmarklet" },
  9   |   { name: "offline",      url: "/~offline" },
  10  | ];
  11  | 
  12  | for (const { name, url } of publicPages) {
  13  |   test(`${name} — no critical/serious WCAG AA violations`, async ({ page }) => {
  14  |     await page.goto(url);
  15  |     await page.waitForLoadState("domcontentloaded");
  16  | 
  17  |     const results = await new AxeBuilder({ page })
  18  |       .withTags(["wcag2a", "wcag2aa"])
  19  |       .exclude("script, style, noscript, [aria-hidden='true']")
  20  |       .analyze();
  21  | 
  22  |     const failures = results.violations.filter(
  23  |       (v) => v.impact === "critical" || v.impact === "serious"
  24  |     );
  25  | 
  26  |     if (failures.length > 0) {
  27  |       const details = failures
  28  |         .map((v) => `  [${v.impact}] ${v.id}: ${v.description}\n    Nodes: ${v.nodes.slice(0,2).map((n) => n.html.slice(0, 120)).join("; ")}`)
  29  |         .join("\n");
  30  |       console.error(`Accessibility violations on ${url}:\n${details}`);
  31  |     }
> 32  |     expect(failures, `${failures.length} critical/serious violations on ${name}`).toHaveLength(0);
      |                                                                                   ^ Error: 1 critical/serious violations on bookmarklet
  33  |   });
  34  | }
  35  | 
  36  | test.describe("Skip navigation", () => {
  37  |   test("skip link exists and has correct target on landing page", async ({ page }) => {
  38  |     await page.goto("/");
  39  |     const skipLink = page.locator('a[href="#main-content"]').first();
  40  |     await expect(skipLink).toBeInViewport({ ratio: 0 }); // off-screen but exists
  41  |     await expect(skipLink).toHaveText(/skip to main content/i);
  42  |   });
  43  | 
  44  |   test("skip link is first Tab stop on landing page", async ({ page }) => {
  45  |     await page.goto("/");
  46  |     await page.keyboard.press("Tab");
  47  |     const focused = await page.evaluate(() => document.activeElement?.getAttribute("href"));
  48  |     expect(focused).toBe("#main-content");
  49  |   });
  50  | 
  51  |   test("skip link is present on auth pages", async ({ page }) => {
  52  |     await page.goto("/auth/login");
  53  |     const skipLink = page.locator('a[href="#main-content"]').first();
  54  |     await expect(skipLink).toBeAttached();
  55  |   });
  56  | 
  57  |   test("skip link destination #main-content exists", async ({ page }) => {
  58  |     await page.goto("/");
  59  |     const target = page.locator("#main-content").first();
  60  |     await expect(target).toBeAttached();
  61  |   });
  62  | });
  63  | 
  64  | test.describe("Keyboard navigation — auth pages", () => {
  65  |   test("login email field is accessible by keyboard", async ({ page }) => {
  66  |     await page.goto("/auth/login");
  67  |     const emailInput = page.getByLabel(/email/i);
  68  |     await emailInput.focus();
  69  |     await expect(emailInput).toBeFocused();
  70  |     expect(await emailInput.getAttribute("type")).toBe("email");
  71  |   });
  72  | 
  73  |   test("login submit button is keyboard-accessible", async ({ page }) => {
  74  |     await page.goto("/auth/login");
  75  |     const submitBtn = page.getByRole("button", { name: /send magic link|sign in/i }).first();
  76  |     await submitBtn.focus();
  77  |     await expect(submitBtn).toBeFocused();
  78  |   });
  79  | 
  80  |   test("signup switches to password mode on button click", async ({ page }) => {
  81  |     await page.goto("/auth/signup");
  82  |     await page.getByRole("button", { name: /^password$/i }).click();
  83  |     const pwField = page.getByLabel(/password/i).first();
  84  |     await expect(pwField).toBeVisible();
  85  |     expect(await pwField.getAttribute("type")).toBe("password");
  86  |   });
  87  | });
  88  | 
  89  | test.describe("ARIA landmarks", () => {
  90  |   test("landing page has main landmark", async ({ page }) => {
  91  |     await page.goto("/");
  92  |     await expect(page.locator("main, [role='main']").first()).toBeAttached();
  93  |   });
  94  | 
  95  |   test("bookmarklet page has main landmark with id=main-content", async ({ page }) => {
  96  |     await page.goto("/bookmarklet");
  97  |     await expect(page.locator("#main-content")).toBeVisible();
  98  |   });
  99  | 
  100 |   test("offline page has heading", async ({ page }) => {
  101 |     await page.goto("/~offline");
  102 |     await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
  103 |   });
  104 | });
  105 | 
  106 | test.describe("Colour contrast", () => {
  107 |   test("text-primary (#f0f0f0) vs bg-base (#0d1117) ≥ 4.5:1", async ({ page }) => {
  108 |     await page.goto("/");
  109 |     const ratio = await page.evaluate(() => {
  110 |       function lum(hex: string) {
  111 |         const h = hex.replace("#","");
  112 |         const r=parseInt(h.slice(0,2),16)/255, g=parseInt(h.slice(2,4),16)/255, b=parseInt(h.slice(4,6),16)/255;
  113 |         const lin=(c: number) => c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
  114 |         return 0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
  115 |       }
  116 |       const l1=lum("#f0f0f0"), l2=lum("#0d1117");
  117 |       return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
  118 |     });
  119 |     expect(ratio).toBeGreaterThanOrEqual(4.5);
  120 |   });
  121 | });
  122 | 
  123 | test.describe("Focus visibility", () => {
  124 |   test("focused button has visible outline", async ({ page }) => {
  125 |     await page.goto("/auth/login");
  126 |     const btn = page.getByRole("button", { name: /magic link/i }).first();
  127 |     await btn.focus();
  128 |     const outline = await btn.evaluate((el) => window.getComputedStyle(el).outlineStyle);
  129 |     // Any non-none outline counts as visible focus
  130 |     expect(outline).not.toBe("none");
  131 |   });
  132 | });
```