"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useKeyboardShortcuts() {
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-search"));
      }

      if (mod && e.key === "n" && pathname === "/cofounder") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("new-conversation"));
      }

      if (e.key === "Escape") {
        window.dispatchEvent(new CustomEvent("close-modals"));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname]);
}
