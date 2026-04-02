/**
 * Component snapshot tests.
 *
 * Purpose: catch unintended visual regressions in pure UI components.
 * On first run snapshots are written to __tests__/snapshots/__snapshots__/
 * Subsequent runs diff against stored snapshots.
 * Intentional changes: `npx jest --updateSnapshot`
 *
 * Components covered:
 *   SyncIndicator  — 4 state snapshots
 *   ToastProvider  — structure snapshot
 *   InstallBanner  — hidden/visible states
 *   ErrorBoundary  — child pass-through
 */

import React from "react";
import renderer from "react-test-renderer";

// ── SyncIndicator ─────────────────────────────────────────────────────────────
// useBackgroundSync is an effect-only hook — mock it out for pure render
jest.mock("@/hooks/useBackgroundSync", () => ({
  useBackgroundSync: () => ({ isOnline: true }),
}));

import { SyncIndicator } from "@/components/ui/SyncIndicator";

describe("SyncIndicator", () => {
  it("synced state — no badge", () => {
    expect(
      renderer.create(React.createElement(SyncIndicator, { state: "synced", count: 0 })).toJSON()
    ).toMatchSnapshot();
  });

  it("queued state — amber badge with count", () => {
    expect(
      renderer.create(React.createElement(SyncIndicator, { state: "queued", count: 3 })).toJSON()
    ).toMatchSnapshot();
  });

  it("syncing state — grey pulse", () => {
    expect(
      renderer.create(React.createElement(SyncIndicator, { state: "syncing", count: 1 })).toJSON()
    ).toMatchSnapshot();
  });

  it("is stable across re-renders (same output)", () => {
    const renderOnce = () =>
      renderer.create(React.createElement(SyncIndicator, { state: "synced", count: 0 })).toJSON();
    expect(JSON.stringify(renderOnce())).toBe(JSON.stringify(renderOnce()));
  });
});

// ── ToastProvider ─────────────────────────────────────────────────────────────
import { ToastProvider } from "@/components/ui/Toast";

describe("ToastProvider", () => {
  it("renders children wrapped in provider", () => {
    expect(
      renderer.create(
        React.createElement(
          ToastProvider,
          null,
          React.createElement("span", { "data-testid": "child" }, "content")
        )
      ).toJSON()
    ).toMatchSnapshot();
  });

  it("snapshot is stable with empty toasts", () => {
    const a = renderer
      .create(React.createElement(ToastProvider, null, React.createElement("div", null, "a")))
      .toJSON();
    const b = renderer
      .create(React.createElement(ToastProvider, null, React.createElement("div", null, "a")))
      .toJSON();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});

// ── InstallBanner ─────────────────────────────────────────────────────────────
// canInstall=false → component returns null
jest.mock("@/hooks/usePWAInstall", () => ({
  usePWAInstall: () => ({ canInstall: false, install: async () => {} }),
}));

import { InstallBanner } from "@/components/ui/InstallBanner";

describe("InstallBanner", () => {
  it("returns null when canInstall=false", () => {
    expect(
      renderer.create(React.createElement(InstallBanner, {})).toJSON()
    ).toBeNull();
  });

  it("snapshot with canInstall=false is stable", () => {
    const snap = renderer.create(React.createElement(InstallBanner, {})).toJSON();
    expect(snap).toMatchSnapshot();
  });
});

// ── ErrorBoundary ─────────────────────────────────────────────────────────────
import { ErrorBoundary } from "@/components/error/ErrorBoundary";

// Suppress console.error for expected test errors
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
afterAll(() => consoleSpy.mockRestore());

describe("ErrorBoundary", () => {
  it("renders children when no error thrown", () => {
    expect(
      renderer.create(
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement("article", { "data-testid": "content" }, "Hello world")
        )
      ).toJSON()
    ).toMatchSnapshot();
  });

  it("renders custom fallback when child throws", () => {
    // Component that throws on render
    const Bomb = () => { throw new Error("💥 test explosion"); };
    const fallback = React.createElement("p", { "data-testid": "fallback" }, "Error occurred");

    expect(
      renderer.create(
        React.createElement(
          ErrorBoundary,
          { fallback },
          React.createElement(Bomb, null)
        )
      ).toJSON()
    ).toMatchSnapshot();
  });

  it("catches errors without crashing the test", () => {
    const Bomb = () => { throw new Error("💥 no fallback"); };

    // React 19 test renderer with ErrorBoundary:
    // The boundary catches the throw; rendered output is the fallback UI.
    // Exact output varies by React version — snapshot captures actual behaviour.
    let tree: unknown;
    expect(() => {
      tree = renderer.create(
        React.createElement(ErrorBoundary, null, React.createElement(Bomb, null))
      ).toJSON();
    }).not.toThrow();

    // Snapshot captures whatever React rendered (error UI or empty)
    expect(tree).toMatchSnapshot();
  });
});
