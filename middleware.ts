import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── Auth-required paths ───────────────────────────────────────────────────────
const AUTH_REQUIRED = ["/app/"];

// ── Rate limit config per route pattern ──────────────────────────────────────
const RATE_LIMITS: Array<{ pattern: RegExp; window: number; max: number }> = [
  { pattern: /^\/api\/auth/,    window: 60,  max: 10  }, // auth: 10/min

  { pattern: /^\/api\/import/,  window: 300, max: 5   }, // import: 5/5min
  { pattern: /^\/api\/account/, window: 60,  max: 5   }, // account ops: 5/min
  { pattern: /^\/api\//,        window: 60,  max: 120 }, // other API: 120/min
];

// In-process rate limit store (single instance — adequate for Vercel)
const RL_STORE = new Map<string, number[]>();

function checkRateLimit(
  ip: string,
  path: string
): { ok: boolean; retryAfter: number } {
  const config = RATE_LIMITS.find((r) => r.pattern.test(path));
  if (!config) return { ok: true, retryAfter: 0 };

  const { window, max } = config;
  const key    = `${path.split("/").slice(0, 3).join("/")}:${ip}`;
  const now    = Date.now();
  const winMs  = window * 1000;

  const ts = (RL_STORE.get(key) ?? []).filter((t) => now - t < winMs);
  ts.push(now);
  RL_STORE.set(key, ts);

  if (ts.length > max) {
    const oldest     = ts[0] ?? now;
    const retryAfter = Math.ceil((oldest + winMs - now) / 1000);
    return { ok: false, retryAfter };
  }
  return { ok: true, retryAfter: 0 };
}

// Security headers added to EVERY response
const SECURITY_HEADERS = {
  "X-Content-Type-Options":             "nosniff",
  "X-Frame-Options":                    "DENY",
  "X-XSS-Protection":                   "1; mode=block",
  "Referrer-Policy":                    "strict-origin-when-cross-origin",
  "Permissions-Policy":                 "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security":          "max-age=63072000; includeSubDomains; preload",
  "X-DNS-Prefetch-Control":             "off",
  "Cross-Origin-Opener-Policy":         "same-origin",
  "Cross-Origin-Resource-Policy":       "same-origin",
  "Cross-Origin-Embedder-Policy":       "require-corp",
};

// Looser COEP/COOP for pages that embed Supabase auth widgets or use postMessage
const RELAXED_HEADERS = {
  "Cross-Origin-Embedder-Policy": "unsafe-none",
  "Cross-Origin-Opener-Policy":   "same-origin-allow-popups",
};

function addSecurityHeaders(
  response: NextResponse,
  path: string
): NextResponse {
  const isAuthPath = path.startsWith("/auth/") || path.startsWith("/app/");
  const headers: Record<string, string> = isAuthPath
    ? { ...SECURITY_HEADERS, ...RELAXED_HEADERS }
    : { ...SECURITY_HEADERS };

  for (const [key, value] of Object.entries(headers)) {
    if (value) response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── 1. Rate limiting (API + auth routes) ──────────────────────────────────
  const isRateLimited = RATE_LIMITS.some((r) => r.pattern.test(pathname));
  if (isRateLimited) {
    const ip = (
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      request.headers.get("x-real-ip") ??
      "unknown"
    );
    const { ok, retryAfter } = checkRateLimit(ip, pathname);
    if (!ok) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": "exceeded",
            ...SECURITY_HEADERS,
          },
        }
      );
    }
  }

  // ── 2. Auth guard for /app/* routes ───────────────────────────────────────
  const needsAuth = AUTH_REQUIRED.some((p) => pathname.startsWith(p));
  if (needsAuth || pathname.startsWith("/auth/")) {
    let response = NextResponse.next({ request });

    // Refresh Supabase session
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, {
                ...options,
                httpOnly:  true,
                secure:    process.env.NODE_ENV === "production",
                sameSite:  "lax",
              });
            });
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect unauthenticated users away from /app/*
    if (!user && needsAuth) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      const redirect = NextResponse.redirect(loginUrl);
      addSecurityHeaders(redirect, pathname);
      return redirect;
    }

    // Redirect authenticated users away from auth pages
    if (user && pathname.startsWith("/auth/") && !pathname.includes("callback") && !pathname.includes("update-password")) {
      const redirect = NextResponse.redirect(new URL("/app/today", request.url));
      addSecurityHeaders(redirect, pathname);
      return redirect;
    }

    addSecurityHeaders(response, pathname);
    return response;
  }

  // ── 3. Static / public routes — just add security headers ─────────────────
  const response = NextResponse.next();
  addSecurityHeaders(response, pathname);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|screenshots/|manifest.json|sw.js).*)",
  ],
};
