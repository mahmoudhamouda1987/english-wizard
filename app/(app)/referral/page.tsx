"use client";

import { useEffect, useState } from "react";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";

export default function ReferralPage() {
  const [data, setData] = useState<{ code: string; inviteUrl: string; invited: number; joined: number; rewardNote: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral", { cache: "no-store" }).then(async (r) => { const p = await r.json(); if (r.ok) setData(p); }).catch(() => undefined);
  }, []);

  async function copyLink() {
    if (!data) return;
    try { await navigator.clipboard.writeText(data.inviteUrl); } catch { /* clipboard unavailable */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🎁" title="Invite friends, grow together" sub="Share your personal link. When a friend joins English Wizard with it, you both unlock rewards — friendship beats streaks." />
      <Celebration trigger={data ? `loaded-${data.joined}` : ""} />

      {!data && <div className="state-card">Preparing your invite…</div>}

      {data && (
        <>
          <section className="panel" style={{ padding: 28, textAlign: "center" }}>
            <p className="eyebrow">Your personal code</p>
            <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: ".12em", color: "var(--accent-text)", margin: "10px 0 4px" }}>{data.code}</div>
            <p className="subtle" style={{ marginBottom: 18 }}>Friends enter this on sign-up — or just open your link.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="button" onClick={() => void copyLink()}>{copied ? "✓ Link copied!" : "Copy invite link"}</button>
              <a className="button secondary" href={`https://wa.me/?text=${encodeURIComponent(`Learn English with me on English Wizard — my invite link: ${data.inviteUrl}`)}`} target="_blank" rel="noreferrer">Share on WhatsApp</a>
              <a className="button secondary" href={`mailto:?subject=${encodeURIComponent("Learn English with me")}&body=${encodeURIComponent(`I'm improving my English on English Wizard. Join with my link: ${data.inviteUrl}`)}`}>Share by email</a>
            </div>
          </section>

          <section className="stat-strip">
            <div className="stat-tile"><strong>{data.invited}</strong><span>Friends invited</span></div>
            <div className="stat-tile"><strong>{data.joined}</strong><span>Joined through you</span></div>
            <div className="stat-tile"><strong>3+</strong><span>Unlocks a premium month</span></div>
          </section>

          <section className="panel" style={{ padding: 24 }}>
            <div className="panel-title"><h3>How it works</h3></div>
            <ol style={{ lineHeight: 2, paddingLeft: 20 }}>
              <li><strong>Share</strong> your link with friends who want better English.</li>
              <li><strong>They sign up</strong> using your code and start with a welcome boost.</li>
              <li><strong>You both progress</strong> — every 3 friends who join unlocks a free premium month for you.</li>
            </ol>
            <p className="subtle">{data.rewardNote}</p>
          </section>
        </>
      )}
    </main>
  );
}
