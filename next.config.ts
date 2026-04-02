import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use Turbopack (Vercel-compatible default in Next.js 16)
  // next-pwa requires webpack; we use a manual SW instead (see public/sw-manual.js)
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

export default nextConfig;
