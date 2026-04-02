/**
 * Telemetry policy — focus app.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  DISABLED BY DEFAULT.  Only active after explicit user opt-in.          │
 * │  No third-party SDKs.  Only connects to /api/telemetry (our own server).│
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * What we track (opt-in only):
 *   signup_completed      — user finished signup + onboarding
 *   first_task_created    — first task created after signup
 *   task_completed        — any task marked complete
 *   onboarding_completed  — onboarding flow finished
 *   telemetry_opted_in    — user toggled telemetry on
 *   telemetry_opted_out   — user toggled telemetry off
 *
 * What we NEVER collect:
 *   - User ID, email, or any PII
 *   - Task content or titles
 *   - IP address
 *   - Full user agent (only browser family: chrome/safari/firefox/other)
 *   - Cross-site tracking
 *
 * Anonymous ID:
 *   - Client-generated 8-char hex derived from a random localStorage UUID
 *   - Cannot be reversed to a user identity
 *   - Rotates if user clears browser storage
 */

export type TelemetryEvent =
  | "signup_completed"
  | "first_task_created"
  | "task_completed"
  | "onboarding_completed"
  | "telemetry_opted_in"
  | "telemetry_opted_out";

const OPT_IN_KEY    = "focus_telemetry_opted_in";
const ANON_ID_KEY   = "focus_telemetry_anon_id";
const SESSION_KEY   = "focus_telemetry_session";
const APP_VERSION   = "0.1.2";

// ── Consent ───────────────────────────────────────────────────────────────────

/** Returns true only if the user has explicitly opted in. */
export function isTelemetryEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(OPT_IN_KEY) === "1";
}

/** Call from Settings when user explicitly opts in. */
export function enableTelemetry(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OPT_IN_KEY, "1");
}

/** Call from Settings when user opts out. */
export function disableTelemetry(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OPT_IN_KEY);
}

// ── Anonymous identity ────────────────────────────────────────────────────────

/**
 * Returns a stable 8-char hex anonymous ID for this device/browser.
 * Generated from a random UUID stored in localStorage — no PII.
 */
function getAnonymousId(): string {
  if (typeof window === "undefined") return "00000000";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    // Generate from random UUID — first 8 hex chars
    const raw = crypto.randomUUID().replace(/-/g, "");
    id = raw.slice(0, 8);
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

/**
 * Returns a per-tab random session ID (sessionStorage — not persisted).
 * Used to group events in the same browser tab without cross-session tracking.
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "00000000-0000-0000-0000-000000000000";
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/** Detect browser family from user agent — no fingerprinting detail. */
function getBrowserFamily(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("firefox")) return "firefox";
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
  if (ua.includes("edg/")) return "edge";
  if (ua.includes("chrome")) return "chrome";
  return "other";
}

// ── Event tracking ────────────────────────────────────────────────────────────

/**
 * Send an anonymous funnel event to /api/telemetry.
 *
 * No-op if:
 *   - Telemetry is disabled (user has not opted in)
 *   - Window is not available (SSR)
 *   - The POST fails (fire-and-forget, never throws)
 */
export function trackEvent(
  name: TelemetryEvent,
  _props?: Record<string, string | number | boolean>
): void {
  if (!isTelemetryEnabled()) return;
  if (typeof window === "undefined") return;

  // Fire and forget — never block the UI thread
  queueMicrotask(() => {
    const payload = {
      event_name:   name,
      anonymous_id: getAnonymousId(),
      session_id:   getSessionId(),
      app_version:  APP_VERSION,
      browser_fam:  getBrowserFamily(),
    };

    fetch("/api/telemetry", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
      // keepalive so the request completes even if page navigates
      keepalive: true,
    }).catch(() => {
      // Silently discard — telemetry must never break the app
    });
  });
}

/**
 * Server-side telemetry helper (API routes only).
 * Used when the client can't fire the event (e.g., signup via server-side redirect).
 * Returns the payload object — caller POSTs it via the service role client.
 */
export function buildServerTelemetryPayload(
  name: TelemetryEvent,
  anonymousId = "server-side"
): Record<string, string> {
  return {
    event_name:   name,
    anonymous_id: anonymousId,
    session_id:   crypto.randomUUID(),
    app_version:  APP_VERSION,
    browser_fam:  "unknown",
  };
}
