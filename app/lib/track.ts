"use client";

/**
 * Best-effort client-side product analytics. Fire-and-forget; never blocks UI.
 * Events are validated server-side against an allow-list.
 */
export function track(event: string, payload?: Record<string, unknown>): void {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event, payload }),
      keepalive: true,
    }).catch(() => {});
  } catch { /* ignore */ }
}
