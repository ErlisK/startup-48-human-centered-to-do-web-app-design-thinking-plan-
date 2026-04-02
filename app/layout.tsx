import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ResourceHints } from "@/components/ui/ResourceHints";

export const metadata: Metadata = {
  title: { template: "%s — focus", default: "focus — tasks that don't pile up" },
  description: "A calm, keyboard-first to-do app. Capture anything instantly. Focus on 3 tasks a day.",
  applicationName: "focus",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "focus" },
  formatDetection: { telephone: false },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-96.png",  sizes: "96x96",  type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ResourceHints />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
