/**
 * Telemetry policy — focus app.
 *
 * Telemetry is DISABLED by default.
 * We do not load any analytics, tracking scripts, or error-reporting SDKs.
 *
 * Future opt-in path (never on by default):
 *   1. User explicitly enables "Share usage statistics" in Settings.
 *   2. We set localStorage key "focus_telemetry_opted_in" = "1".
 *   3. Only then do we send anonymised, aggregated events to our own endpoint.
 *
 * We never:
 *   - Load Google Analytics, Mixpanel, Amplitude, Sentry, LogRocket, or any
 *     third-party tracking SDK automatically.
 *   - Store fingerprinting data.
 *   - Share data with advertisers.
 *   - Use cross-site cookies.
 */

const OPT_IN_KEY = "focus_telemetry_opted_in";

/** Returns true only if the user has explicitly opted in. */
export function isTelemetryEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OPT_IN_KEY) === "1";
}

/** Called from Settings when user explicitly opts in. */
export function enableTelemetry(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OPT_IN_KEY, "1");
}

/** Called from Settings when user opts out. */
export function disableTelemetry(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OPT_IN_KEY);
}

/**
 * No-op event tracker.
 * Replace body with actual send logic only after user opt-in.
 * Never fire automatically at startup.
 */
export function trackEvent(_name: string, _props?: Record<string, string | number | boolean>): void {
  if (!isTelemetryEnabled()) return;
  // Future: POST to /api/telemetry with anonymised, hashed user_id + event name.
  // No personal data, no cross-site sharing.
}
