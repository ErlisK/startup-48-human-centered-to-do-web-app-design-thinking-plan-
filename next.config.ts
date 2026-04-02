import type { NextConfig } from "next";
import withPWAInit, { runtimeCaching as defaultCache } from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      // Supabase REST API — NetworkFirst (fresh data, offline fallback)
      {
        urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/rest\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-rest",
          expiration: { maxEntries: 64, maxAgeSeconds: 86400 },
          networkTimeoutSeconds: 5,
        },
      },
      // Supabase auth — NetworkOnly (never cache credentials)
      {
        urlPattern: /^https:\/\/[a-z0-9]+\.supabase\.co\/auth\//,
        handler: "NetworkOnly",
      },
      // App pages (HTML) — NetworkFirst
      {
        urlPattern: ({ request }: { request: Request }) => request.destination === "document",
        handler: "NetworkFirst",
        options: {
          cacheName: "app-pages",
          expiration: { maxEntries: 32, maxAgeSeconds: 86400 },
          networkTimeoutSeconds: 5,
        },
      },
      // Static assets — CacheFirst
      {
        urlPattern: /\.(png|svg|ico|woff2?|ttf)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: { maxEntries: 64, maxAgeSeconds: 2592000 },
        },
      },
      // Default cache for everything else
      ...defaultCache,
    ],
  },
});

const nextConfig: NextConfig = {
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

export default withPWA(nextConfig);
