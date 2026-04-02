"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useVimNav() {
  const router = useRouter();
  useEffect(() => {
    let gPressed = false;
    let timer: ReturnType<typeof setTimeout>;
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "g" || e.key === "G") {
        gPressed = true;
        clearTimeout(timer);
        timer = setTimeout(() => { gPressed = false; }, 500);
        return;
      }
      if (gPressed) {
        if (e.key === "t" || e.key === "T") { e.preventDefault(); router.push("/app/today"); }
        if (e.key === "i" || e.key === "I") { e.preventDefault(); router.push("/app/inbox"); }
        gPressed = false;
        clearTimeout(timer);
      }
    };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); clearTimeout(timer); };
  }, [router]);
}
