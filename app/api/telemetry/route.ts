/**
 * POST /api/telemetry
 *
 * Accepts anonymous, opt-in funnel events from the client.
 *
 * Contract:
 *   - No auth required (events are anonymous by design)
 *   - Rate-limited: 20 events/min per IP (prevents abuse)
 *   - Validates event_name against an allowlist
 *   - Strips and ignores any PII-adjacent fields
 *   - Writes via service role (RLS bypass — no user context)
 *   - Returns 204 No Content on success (no data echoed back)
 *
 * Privacy guarantees:
 *   - Server never logs or stores IP addresses
 *   - anonymous_id is truncated to 8 hex chars max
 *   - session_id is a UUID (not linked to any auth session)
 *   - We never read back telemetry via this route
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { createClient } from "@supabase/supabase-js";

/** Service-role Supabase client for RLS-bypass inserts */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

const ALLOWED_EVENTS = new Set([
  "signup_completed",
  "first_task_created",
  "task_completed",
  "onboarding_completed",
  "telemetry_opted_in",
  "telemetry_opted_out",
]);

const UUID_RE      = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_RE       = /^[0-9a-f]{1,16}$/i;
const SEMVER_RE    = /^\d+\.\d+\.\d+$/;
const BROWSER_ALLOW = new Set(["chrome", "firefox", "safari", "edge", "other", "unknown"]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Rate limit: 20 events / 60s per IP
  const { ok, retryAfter } = await rateLimit(req, { prefix: "telemetry", window: 60, max: 20 });
  if (!ok) return rateLimitResponse(retryAfter);

  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return new NextResponse(null, { status: 400 }); }

  const { event_name, anonymous_id, session_id, app_version, browser_fam } = body;

  // Strict allow-list validation — reject anything that doesn't match exactly
  if (
    typeof event_name   !== "string" || !ALLOWED_EVENTS.has(event_name)           ||
    typeof anonymous_id !== "string" || !HEX_RE.test(anonymous_id.slice(0, 16))   ||
    typeof session_id   !== "string" || !UUID_RE.test(session_id)                  ||
    typeof app_version  !== "string" || !SEMVER_RE.test(app_version)               ||
    typeof browser_fam  !== "string" || !BROWSER_ALLOW.has(browser_fam)
  ) {
    return new NextResponse(null, { status: 422 });
  }

  // Write via service-role client (telemetry_events has no user insert policy)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = getAdminClient() as any;

  const { error } = await db.from("telemetry_events").insert({
    event_name,
    anonymous_id: (anonymous_id as string).slice(0, 8).toLowerCase(),
    session_id,
    app_version,
    browser_fam,
  });

  if (error) {
    // Server-side log only — never surface to client
    console.error("[telemetry] insert error:", error.message);
  }

  // Always 204 — never echo data back to client
  return new NextResponse(null, { status: 204 });
}

export async function GET():    Promise<NextResponse> { return new NextResponse(null, { status: 405 }); }
export async function DELETE(): Promise<NextResponse> { return new NextResponse(null, { status: 405 }); }
