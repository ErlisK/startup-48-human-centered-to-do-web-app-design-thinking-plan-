"use client";
import { ToastProvider } from "@/components/ui/Toast";
import { NavBar } from "@/components/ui/NavBar";
import { useVimNav } from "@/hooks/useVimNav";

function AppShell({ children }: { children: React.ReactNode }) {
  useVimNav(); // HV-014: G+T, G+I
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main style={{ flex: 1, maxWidth: 640, width: "100%", margin: "0 auto", paddingBottom: 80 }}>
        {children}
      </main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
