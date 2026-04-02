/**
 * In-process rate limiter using a sliding-window counter.
 *
 * This is sufficient for a single-instance Vercel deployment.
 * For multi-region / multi-instance, swap the backing store for Upstash Redis.
 *
 * Usage:
 *   const { ok, retryAfter } = await rateLimit(req, { window: 60, max: 20 });
 *   if (!ok) return rateLimitResponse(retryAfter);
 */

import { type NextRequest, NextResponse } from "next/server";

interface RateLimitOptions {
  /** Window size in seconds */
  window?: number;
  /** Max requests per window */
  max?: number;
  /** Key prefix for namespacing (e.g. "auth", "api") */
  prefix?: string;
}

interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfter: number; // seconds
}

// Sliding window store: key → [timestamp, count][]
const store = new Map<string, number[]>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
      const fresh = timestamps.filter((t) => now - t < 3600_000);
      if (fresh.length === 0) store.delete(key);
      else store.set(key, fresh);
    }
  }, 5 * 60 * 1000);
}

/** Extract a stable client identifier from the request */
function getClientKey(req: NextRequest, prefix: string): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return `${prefix}:${ip}`;
}

/** Check rate limit for this request */
export async function rateLimit(
  req: NextRequest,
  opts: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const { window = 60, max = 30, prefix = "api" } = opts;
  const windowMs = window * 1000;
  const key      = getClientKey(req, prefix);
  const now      = Date.now();

  const timestamps = (store.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  store.set(key, timestamps);

  const count     = timestamps.length;
  const remaining = Math.max(0, max - count);
  const ok        = count <= max;
  const oldest    = timestamps[0] ?? now;
  const retryAfter = ok ? 0 : Math.ceil((oldest + windowMs - now) / 1000);

  return { ok, remaining, retryAfter };
}

/** Build a 429 Too Many Requests response */
export function rateLimitResponse(retryAfter = 60): NextResponse {
  return NextResponse.json(
    { error: "Too many requests", retryAfter },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": "exceeded",
        "Content-Type": "application/json",
      },
    }
  );
}

/** Convenience headers to add to successful responses */
export function rateLimitHeaders(remaining: number, max: number, window: number) {
  return {
    "X-RateLimit-Limit":     String(max),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset":     String(Math.floor(Date.now() / 1000) + window),
  };
}
