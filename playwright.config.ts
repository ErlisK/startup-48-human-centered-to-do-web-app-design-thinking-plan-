import { defineConfig, devices } from "@playwright/test";
import path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    // Visual snapshot settings
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.03,
      threshold: 0.2,
      animations: "disabled",
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.03,
      threshold: 0.2,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["line"],
  ],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
  },
  // Snapshot directory: baselines stored per project
  snapshotDir: "./e2e/visual/__baselines__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}{ext}",
  projects: [
    // ── Core flow tests ───────────────────────────────────────────────────────
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testMatch: [
        "e2e/auth.spec.ts",
        "e2e/capture-flow.spec.ts",
        "e2e/today-view.spec.ts",
        "e2e/settings-data.spec.ts",
        "e2e/pwa-offline.spec.ts",
        "e2e/accessibility.spec.ts",
      ],
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: [
        "e2e/auth.spec.ts",
        "e2e/capture-flow.spec.ts",
        "e2e/settings-data.spec.ts",
        "e2e/pwa-offline.spec.ts",
      ],
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: [
        "e2e/auth.spec.ts",
        "e2e/capture-flow.spec.ts",
        "e2e/pwa-offline.spec.ts",
      ],
    },
    // ── Visual regression — Chromium only (consistent rendering) ─────────────
    {
      name: "visual",
      use: { ...devices["Desktop Chrome"] },
      testMatch: ["e2e/visual/**/*.spec.ts"],
      retries: 0, // No retries for visual tests — fail fast
    },
    {
      name: "visual-mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: ["e2e/visual/**/*.spec.ts"],
      retries: 0,
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
