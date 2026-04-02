/**
 * Centralised observability module.
 *
 * All error/event tracking flows through here.
 * When NEXT_PUBLIC_SENTRY_DSN is set, events go to Sentry.
 * Otherwise they are logged to console only (dev mode).
 *
 * Never import Sentry directly in feature code — always use this module.
 */

import * as Sentry from "@sentry/nextjs";

const IS_PROD = process.env.NODE_ENV === "production";
const HAS_DSN = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

/** Capture an unexpected exception */
export function captureError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  if (!IS_PROD || !HAS_DSN) {
    console.error("[focus/error]", error, context);
    return;
  }
  Sentry.captureException(error, { extra: context });
}

/** Track a named event for debugging (not user analytics) */
export function captureEvent(
  name: string,
  data?: Record<string, string | number | boolean>
): void {
  if (!IS_PROD || !HAS_DSN) {
    console.debug("[focus/event]", name, data);
    return;
  }
  Sentry.addBreadcrumb({ message: name, data, level: "info" });
}

/** Set user context (call on login; use hashed user_id, never PII) */
export function setUserContext(hashedId: string): void {
  if (HAS_DSN) Sentry.setUser({ id: hashedId });
}

/** Clear user context on logout */
export function clearUserContext(): void {
  if (HAS_DSN) Sentry.setUser(null);
}

/** Report an API latency measurement against the P99 budget */
export function reportApiLatency(route: string, ms: number): void {
  const P99_BUDGET_MS = 300;
  if (ms > P99_BUDGET_MS) {
    captureEvent("api_latency_exceeded", { route, ms, budget: P99_BUDGET_MS });
  }
}
