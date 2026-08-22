"use client";

import { useEffect, useState } from "react";

interface Entry { rank: number; name: string; xp: number; isMe?: boolean }

export default function LeaderboardPage() {
  const [top, setTop] = useState<Entry[] | null>(null);
  const [me, setMe] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Unable to load leaderboard."))))
      .then((p) => { setTop(p.top); setMe(p.me); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load leaderboard."));
  }, []);

  return (
    <main id="main-content" className="dash-main">
      <header className="dash-header">
        <div>
          <p className="eyebrow">This week</p>
          <h1>Leaderboard</h1>
          <p className="subtle">XP earned from real learning evidence in the last 7 days.</p>
        </div>
        {me && <span className="streak-pill">You are #{me.rank} · {me.xp} XP</span>}
      </header>

      {!top && !error && <div className="state-card">Loading rankings…</div>}
      {error && <p role="alert" className="state-card error">{error}</p>}

      {top && (
        <section className="panel" aria-label="Weekly ranking">
          {top.length === 0 && <p className="empty">No activity yet this week — be the first to earn XP.</p>}
          {top.map((entry) => (
            <div key={entry.rank} className="ach-row" style={entry.isMe ? { background: "#f2f0fb", borderRadius: 12, paddingInline: 10 } : undefined}>
              <span className="ach-icon" aria-hidden="true">{entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}</span>
              <div><strong>{entry.name}{entry.isMe ? " (you)" : ""}</strong><small>{entry.xp >= 100 ? "On fire this week" : entry.xp > 0 ? "Making progress" : "No activity yet"}</small></div>
              <em className="xp-tag">{entry.xp} XP</em>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
