"use client";
import { useState, useCallback } from "react";
import { ToastProvider } from "@/components/ui/Toast";
import { NavBar } from "@/components/ui/NavBar";
import { useVimNav } from "@/hooks/useVimNav";
import { InstallBanner } from "@/components/ui/InstallBanner";
import { QuickCaptureModal } from "@/components/capture/QuickCaptureModal";
import { useTasks } from "@/hooks/useTasks";

function AppShell({ children }: { children: React.ReactNode }) {
  useVimNav();
  const { addTask } = useTasks("inbox"); // for global quick capture

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <NavBar />
      <main style={{ flex: 1, maxWidth: 640, width: "100%", margin: "0 auto", paddingBottom: 80 }}>
        {children}
      </main>
      {/* Global Cmd+K modal — available on every page */}
      <QuickCaptureModal onAdd={addTask} />
      {/* PWA install prompt */}
      <InstallBanner />
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
