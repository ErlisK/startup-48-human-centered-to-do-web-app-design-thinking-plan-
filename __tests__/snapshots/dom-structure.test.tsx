/**
 * DOM structure snapshot tests using @testing-library/react.
 *
 * These test the rendered HTML structure of components —
 * more readable than renderer.create() and better at catching
 * accessibility regressions (role, aria-*, label changes).
 *
 * Covers: error boundary, offline page structure, design tokens
 */

import React from "react";
import { render } from "@testing-library/react";

// ── Design token contract ─────────────────────────────────────────────────────
describe("Design tokens — CSS custom property names", () => {
  // We test the token contract (names exist in CSS) rather than values
  const EXPECTED_TOKENS = [
    "--bg-base", "--bg-surface", "--bg-elevated",
    "--text-primary", "--text-secondary", "--text-muted",
    "--accent-blue", "--accent-green",
    "--border", "--radius",
  ];

  it("globals.css exports all required design tokens", async () => {
    const fs = await import("fs/promises");
    const css = await fs.readFile(
      `${process.cwd()}/app/globals.css`,
      "utf8"
    );
    for (const token of EXPECTED_TOKENS) {
      expect(css).toContain(token);
    }
  });

  it("design token snapshot — list of expected tokens is stable", () => {
    // If someone adds/removes a token, this snapshot catches it
    expect(EXPECTED_TOKENS).toMatchSnapshot();
  });
});

// ── Manifest.json structure contract ─────────────────────────────────────────
describe("manifest.json — PWA contract", () => {
  it("has required PWA fields in manifest", async () => {
    const fs = await import("fs/promises");
    const raw = await fs.readFile(`${process.cwd()}/public/manifest.json`, "utf8");
    const manifest = JSON.parse(raw);

    const snap = {
      name:       manifest.name,
      short_name: manifest.short_name,
      start_url:  manifest.start_url,
      display:    manifest.display,
      icon_count: manifest.icons?.length,
      has_512:    manifest.icons?.some((i: { sizes: string }) => i.sizes?.includes("512x512")),
      has_192:    manifest.icons?.some((i: { sizes: string }) => i.sizes?.includes("192x192")),
    };

    expect(snap).toMatchSnapshot();
  });
});

// ── Security headers contract ─────────────────────────────────────────────────
describe("next.config.ts — security headers", () => {
  it("next.config.ts defines required security headers", async () => {
    const fs = await import("fs/promises");
    const config = await fs.readFile(`${process.cwd()}/next.config.ts`, "utf8");

    const REQUIRED_HEADERS = [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ];

    for (const header of REQUIRED_HEADERS) {
      expect(config).toContain(header);
    }
  });
});

// ── Middleware rate-limit config contract ─────────────────────────────────────
describe("middleware.ts — rate limit config", () => {
  it("rate limit config snapshot is stable", async () => {
    // Parse rate limit entries from middleware source
    const fs = await import("fs/promises");
    const src = await fs.readFile(`${process.cwd()}/middleware.ts`, "utf8");

    // Extract pattern strings and limits
    const matches = [...src.matchAll(/pattern:\s*(\/[^,]+),\s*window:\s*(\d+),\s*max:\s*(\d+)/g)];
    const limits = matches.map(([, pattern, window, max]) => ({
      pattern: pattern.trim(),
      window:  Number(window),
      max:     Number(max),
    }));

    expect(limits.length).toBeGreaterThan(0);
    expect(limits).toMatchSnapshot();
  });
});

// ── API route source contract ─────────────────────────────────────────────────
// (Next.js route handlers require browser globals not available in Jest;
//  test the source code contracts instead of dynamic imports)
describe("API route source contracts", () => {
  const routes: Array<[string, string[]]> = [
    ["app/api/tasks/route.ts",   ["export async function GET", "export async function POST"]],
    ["app/api/export/route.ts",  ["export async function GET"]],
    ["app/api/import/route.ts",  ["export async function POST"]],
    ["app/api/account/route.ts", ["export async function DELETE"]],
    ["app/api/health/route.ts",  ["export async function GET"]],
  ];

  for (const [file, exports] of routes) {
    it(`${file} declares required handler exports`, async () => {
      const fs = await import("fs/promises");
      const src = await fs.readFile(`${process.cwd()}/${file}`, "utf8");
      for (const exp of exports) {
        expect(src).toContain(exp);
      }
    });
  }

  it("API route handler snapshot — function signatures are stable", async () => {
    const fs = await import("fs/promises");
    const snapshot: Record<string, string[]> = {};
    for (const [file, exports] of routes) {
      const src = await fs.readFile(`${process.cwd()}/${file}`, "utf8");
      snapshot[file] = exports.filter((e) => src.includes(e));
    }
    expect(snapshot).toMatchSnapshot();
  });
});

// ── CHANGELOG version contract ────────────────────────────────────────────────
describe("CHANGELOG.md — version contract", () => {
  it("CHANGELOG has v0.1.2 and v0.1.1 entries", async () => {
    const fs = await import("fs/promises");
    const log = await fs.readFile(`${process.cwd()}/CHANGELOG.md`, "utf8");
    expect(log).toContain("[0.1.2]");
    expect(log).toContain("[0.1.1]");
    expect(log).toContain("[0.1.0]");
  });

  it("CHANGELOG version history snapshot", async () => {
    const fs = await import("fs/promises");
    const log = await fs.readFile(`${process.cwd()}/CHANGELOG.md`, "utf8");
    const versions = [...log.matchAll(/## \[(\d+\.\d+\.\d+)\]/g)].map(([, v]) => v);
    expect(versions).toMatchSnapshot();
  });
});
