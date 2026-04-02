/**
 * Telemetry: off by default, opt-in only.
 * jsdom environment provides window + localStorage.
 */

// Clear localStorage before each test
beforeEach(() => localStorage.clear());

// Import after clearing to get fresh module state
import { isTelemetryEnabled, enableTelemetry, disableTelemetry, trackEvent } from "@/lib/privacy/telemetry";

describe("Telemetry — default state", () => {
  it("is DISABLED by default",           () => expect(isTelemetryEnabled()).toBe(false));
  it("trackEvent is no-op when disabled",() => {
    expect(() => trackEvent("test_event", { page: "today" })).not.toThrow();
  });
  it("no localStorage keys set on load", () => {
    expect(localStorage.length).toBe(0);
  });
});

describe("Telemetry — opt-in", () => {
  it("enables when user explicitly opts in", () => {
    enableTelemetry();
    expect(isTelemetryEnabled()).toBe(true);
  });
  it("disables after opt-out",               () => {
    enableTelemetry();
    disableTelemetry();
    expect(isTelemetryEnabled()).toBe(false);
  });
  it("persists as localStorage key '1'",    () => {
    enableTelemetry();
    expect(localStorage.getItem("focus_telemetry_opted_in")).toBe("1");
  });
  it("opt-out removes the localStorage key",() => {
    enableTelemetry();
    disableTelemetry();
    expect(localStorage.getItem("focus_telemetry_opted_in")).toBeNull();
  });
});

describe("Telemetry — privacy assertions", () => {
  it("only one key written on opt-in",       () => {
    enableTelemetry();
    expect(localStorage.length).toBe(1);
  });
  it("key is namespaced with focus_ prefix", () => {
    enableTelemetry();
    expect(localStorage.key(0)).toBe("focus_telemetry_opted_in");
  });
});
