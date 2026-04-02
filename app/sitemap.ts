import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://startup-48-human-centered-to-do-web.vercel.app";

  return [
    {
      url: base,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${base}/auth/login`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${base}/auth/signup`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${base}/privacy`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/install`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/bookmarklet`,
      lastModified: new Date("2026-04-02"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
