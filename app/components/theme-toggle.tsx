"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() => (typeof window !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light"));

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("ew-theme", next);
    setTheme(next);
  }

  return (
    <button type="button" className="theme-btn" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Toggle light / dark">
      <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
