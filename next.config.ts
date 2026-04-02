import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: { optimizePackageImports: ["chrono-node"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "X-XSS-Protection",        value: "1; mode=block" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control",           value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed",  value: "/" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options — only used when SENTRY_AUTH_TOKEN is set in CI
  org: process.env.SENTRY_ORG ?? "focus-app",
  project: process.env.SENTRY_PROJECT ?? "focus-mvp",
  // Suppress Sentry output in builds unless explicitly debugging
  silent: !process.env.CI,
  // Don't fail build if Sentry upload fails (graceful degradation)
  errorHandler(err) {
    console.warn("[sentry] Source map upload warning:", err.message);
  },
  // Disable automatic instrumentation that conflicts with turbopack
  autoInstrumentServerFunctions: false,
  autoInstrumentMiddleware: false,
  // Keep our manual CSP headers — don't let Sentry overwrite them
  widenClientFileUpload: false,
  disableLogger: true,

});
