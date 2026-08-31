"use client";

import { useState } from "react";

export interface UpgradeInfo { feature: string; neededTier: string; usedToday?: number; quota?: number | null }

/** Rendered when an API answers 402 with an `upgrade` payload — the felt free-tier wall, with a way out. */
export function UpgradePrompt({ info, onClose }: { info: UpgradeInfo; onClose: () => void }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <section className="panel" role="alert" style={{ marginTop: 16, padding: 22, borderLeft: "4px solid #f59e0b" }}>
      <div className="panel-title">
        <h3>🔓 Free limit reached</h3>
        <button className="link-button" onClick={() => { setDismissed(true); onClose(); }}>Dismiss</button>
      </div>
      <p style={{ lineHeight: 1.7 }}>
        You&rsquo;ve used <strong>{info.usedToday ?? info.quota}</strong> of your {info.quota ?? "limited"} free sessions for this tool today.
        The core curriculum stays included with every account — but <strong>a subscription unlocks 30 daily AI sessions with any product, unlimited with All Access</strong>,
        exam pathways, deep study and boss missions.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
        <a className="button" href="/pricing">See plans &amp; upgrade →</a>
        <a className="button secondary" href="/dashboard">Keep learning free today</a>
      </div>
    </section>
  );
}

export function parseUpgradePayload(payload: unknown): UpgradeInfo | null {
  if (payload && typeof payload === "object" && "upgrade" in payload) {
    const upgrade = (payload as { upgrade?: unknown }).upgrade;
    if (upgrade && typeof upgrade === "object" && "feature" in upgrade && "neededTier" in upgrade) {
      return upgrade as UpgradeInfo;
    }
  }
  return null;
}
