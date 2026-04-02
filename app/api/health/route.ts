import { NextResponse } from "next/server";

/**
 * Health check endpoint.
 * Used by Lighthouse CI (excluded from Sentry instrumentation),
 * load balancers, and uptime monitors.
 * Returns {ok, ts, version} — no auth required.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? "local",
    env: process.env.NODE_ENV,
  }, {
    headers: {
      "Cache-Control": "no-store, no-cache",
      "X-Robots-Tag": "noindex",
    },
  });
}
