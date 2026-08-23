"use client";

import { useEffect } from "react";

/** Re-asserts the persisted theme after React hydration, in case the html attribute gets stripped during hydration. */
export function ThemeApply() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ew-theme");
      if (stored === "dark") document.documentElement.setAttribute("data-theme", "dark");
      else document.documentElement.removeAttribute("data-theme");
    } catch { /* private mode */ }
  }, []);
  return null;
}
