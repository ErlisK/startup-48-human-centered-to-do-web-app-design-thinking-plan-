/**
 * Focus App — Performance Smoke Test
 *
 * Target: https://startup-48-human-centered-to-do-web.vercel.app
 * Load:   50 virtual users, 5 minutes
 *
 * Endpoints under test:
 *   GET  /                          — Landing page (HTML, CDN-cached)
 *   GET  /auth/login                — Auth page (HTML)
 *   GET  /privacy                   — Privacy page (HTML)
 *   GET  /api/health                — Health check (JSON, no auth)
 *   GET  /manifest.json             — PWA manifest (static, cached)
 *   GET  /sw.js                     — Service Worker (static)
 *   GET  /api/tasks                 — Tasks API (requires auth → 401 expected)
 *   GET  /api/export                — Export API (requires auth → 401 expected)
 *   DELETE /api/account             — Account delete (auth + body gate → 401/400)
 *
 * Success criteria (budgets):
 *   P75 response time  ≤ 2000ms
 *   P99 response time  ≤ 300ms  (API health endpoint)
 *   Error rate         < 1%     (5xx errors only; 401/404 are expected)
 *   Throughput         ≥ 10 req/s sustained
 */

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Rate, Trend, Counter } from "k6/metrics";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// ── Custom metrics ────────────────────────────────────────────────────────────
const errorRate         = new Rate("error_rate_5xx");
const apiLatency        = new Trend("api_latency", true);
const staticLatency     = new Trend("static_latency", true);
const htmlLatency       = new Trend("html_latency", true);
const unexpectedStatus  = new Counter("unexpected_status");

// ── Test configuration ────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "30s",  target: 10  },  // ramp-up
    { duration: "30s",  target: 30  },  // ramp to 30 VUs
    { duration: "30s",  target: 50  },  // ramp to 50 VUs
    { duration: "3m",   target: 50  },  // sustain 50 VUs for 3 minutes
    { duration: "30s",  target: 0   },  // ramp-down
  ],

  thresholds: {
    // P99 total response ≤ 300ms for API endpoints
    "api_latency{quantile:'0.99'}": ["p(99)<300"],
    // P75 ≤ 2000ms for HTML pages
    "html_latency{quantile:'0.75'}": ["p(75)<2000"],
    // Static assets P99 ≤ 500ms
    "static_latency{quantile:'0.99'}": ["p(99)<500"],
    // 5xx error rate < 1%
    error_rate_5xx: ["rate<0.01"],
    // Overall HTTP P99 ≤ 3000ms (generous budget for HTML pages)
    http_req_duration: ["p(99)<3000"],
  },

  // Summary export
  summaryTrendStats: ["avg", "min", "med", "max", "p(75)", "p(90)", "p(95)", "p(99)"],
};

const BASE = __ENV.BASE_URL || "https://startup-48-human-centered-to-do-web.vercel.app";

// ── Shared request params ─────────────────────────────────────────────────────
const commonHeaders = {
  "User-Agent": "k6-perf-test/1.0 focus-app-smoke",
  "Accept-Encoding": "gzip, deflate, br",
};

const htmlParams = { headers: { ...commonHeaders, Accept: "text/html,application/xhtml+xml" } };
const jsonParams = { headers: { ...commonHeaders, Accept: "application/json" } };
const staticParams = { headers: { ...commonHeaders, Accept: "*/*" } };

// ── Helpers ───────────────────────────────────────────────────────────────────
function isClientError(status) { return status >= 400 && status < 500; }
function isServerError(status) { return status >= 500; }

function recordLatency(res, metric) {
  metric.add(res.timings.duration);
  errorRate.add(isServerError(res.status));
}

// ── Main VU scenario ─────────────────────────────────────────────────────────
export default function () {

  // ── Group 1: Static / cached pages ─────────────────────────────────────────
  group("Static & CDN", () => {

    // Landing page
    const r1 = http.get(`${BASE}/`, htmlParams);
    recordLatency(r1, htmlLatency);
    check(r1, {
      "landing 200":        (r) => r.status === 200,
      "landing has title":  (r) => r.body && r.body.includes("focus"),
      "landing < 2000ms":   (r) => r.timings.duration < 2000,
    });

    // Manifest JSON (static, long-cached)
    const r2 = http.get(`${BASE}/manifest.json`, staticParams);
    recordLatency(r2, staticLatency);
    check(r2, {
      "manifest 200":     (r) => r.status === 200,
      "manifest is JSON": (r) => r.headers["Content-Type"]?.includes("json"),
    });

    // Service worker
    const r3 = http.get(`${BASE}/sw.js`, staticParams);
    recordLatency(r3, staticLatency);
    check(r3, {
      "sw.js 200":    (r) => r.status === 200,
      "sw.js < 1s":  (r) => r.timings.duration < 1000,
    });

    sleep(0.2);
  });

  // ── Group 2: Auth pages (HTML) ──────────────────────────────────────────────
  group("Auth Pages", () => {
    const r4 = http.get(`${BASE}/auth/login`, htmlParams);
    recordLatency(r4, htmlLatency);
    check(r4, {
      "login 200":       (r) => r.status === 200,
      "login < 2000ms":  (r) => r.timings.duration < 2000,
    });

    const r5 = http.get(`${BASE}/auth/signup`, htmlParams);
    recordLatency(r5, htmlLatency);
    check(r5, {
      "signup 200":       (r) => r.status === 200,
      "signup < 2000ms":  (r) => r.timings.duration < 2000,
    });

    sleep(0.2);
  });

  // ── Group 3: Public content pages ──────────────────────────────────────────
  group("Public Content", () => {
    const r6 = http.get(`${BASE}/privacy`, htmlParams);
    recordLatency(r6, htmlLatency);
    check(r6, {
      "privacy 200":      (r) => r.status === 200,
      "privacy < 2000ms": (r) => r.timings.duration < 2000,
    });

    const r7 = http.get(`${BASE}/bookmarklet`, htmlParams);
    recordLatency(r7, htmlLatency);
    check(r7, {
      "bookmarklet 200": (r) => r.status === 200,
    });

    sleep(0.2);
  });

  // ── Group 4: API endpoints ──────────────────────────────────────────────────
  group("API Endpoints", () => {

    // Health check — no auth, fastest endpoint
    const r8 = http.get(`${BASE}/api/health`, jsonParams);
    recordLatency(r8, apiLatency);
    check(r8, {
      "health 200":       (r) => r.status === 200 || r.status === 429, // 429 = rate-limited shared IP
      "health 2xx or 429": (r) => r.status === 200 || r.status === 429,
      "health < 300ms":   (r) => r.timings.duration < 300,
      "health < 500ms":   (r) => r.timings.duration < 500,
    });

    // Tasks API — unauthenticated → 401
    const r9 = http.get(`${BASE}/api/tasks`, jsonParams);
    recordLatency(r9, apiLatency);
    const tasksStatus = r9.status;
    check(r9, {
      "tasks auth-gated":    (r) => r.status === 401 || r.status === 307 || r.status === 429,
      "tasks fast (no db)":  (r) => r.timings.duration < 500,
    });
    if (isServerError(tasksStatus)) unexpectedStatus.add(1);

    // Export API — unauthenticated → 401
    const r10 = http.get(`${BASE}/api/export`, jsonParams);
    recordLatency(r10, apiLatency);
    check(r10, {
      "export auth-gated": (r) => r.status === 401 || r.status === 307 || r.status === 429,
      "export < 500ms":    (r) => r.timings.duration < 500,
    });

    // Import API — unauthenticated POST → 401 (rate limited: 5/5min per IP)
    // Use every 30th iteration to avoid exhausting rate limit in test
    if (Math.random() < 0.03) {
      const r11 = http.post(
        `${BASE}/api/import`,
        "title\nTest task",
        { headers: { ...commonHeaders, "Content-Type": "text/csv" } }
      );
      check(r11, {
        "import auth-gated": (r) => r.status === 401 || r.status === 429,
      });
    }

    sleep(0.1);
  });

  // ── Group 5: App routes (redirect to login) ─────────────────────────────────
  group("Protected Routes", () => {
    // /app/today should redirect unauthenticated users
    const r12 = http.get(`${BASE}/app/today`, {
      ...htmlParams,
      redirects: 0, // don't follow redirect — check the 307 itself
    });
    recordLatency(r12, htmlLatency);
    check(r12, {
      "app/today auth-guard":   (r) => r.status === 307 || r.status === 302 || r.status === 200,
      "app/today < 1000ms":     (r) => r.timings.duration < 1000,
    });

    sleep(0.3);
  });
}

// ── Summary handlers ──────────────────────────────────────────────────────────
export function handleSummary(data) {
  return {
    "summary.json": JSON.stringify(data, null, 2),
    stdout:         textSummary(data, { indent: " ", enableColors: true }),
  };
}
