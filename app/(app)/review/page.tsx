"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { track } from "@/app/lib/track";

type ReviewCard = { id: string; skill: string; prompt: string; answer: string | null; interval_days: number; repetitions: number };
type MasteryRecord = { skill: string; score: number; level: string };

export default function ReviewPage() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [mastery, setMastery] = useState<MasteryRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    track("review_entered");
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [reviewRes, stateRes] = await Promise.all([
          fetch("/api/review", { cache: "no-store" }),
          fetch("/api/learner-state", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        const payload = await reviewRes.json();
        if (cancelled) return;
        if (reviewRes.ok) setCards(payload.cards ?? []);
        else setLoadError(true);
        const m = stateRes?.state?.mastery;
        if (Array.isArray(m)) setMastery(m as MasteryRecord[]);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function rate(quality: number) {
    const card = cards[index];
    if (!card) return;
    const response = await fetch("/api/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cardId: card.id, quality }) });
    const payload = await response.json();
    if (!response.ok) { setMessage(payload.error ?? "Unable to save your review. Try again."); return; }
    setMessage(`Scheduled — this item returns in about ${payload.intervalDays} day${payload.intervalDays === 1 ? "" : "s"}.`);
    setShowAnswer(false);
    setIndex((value) => value + 1);
  }

  const needsAttention = useMemo(() => mastery.filter((m) => m.score < 60).slice(0, 5), [mastery]);
  const mastered = useMemo(() => mastery.filter((m) => m.score >= 85).slice(0, 5), [mastery]);

  const card = cards[index];

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Strengthen what you have learned"
        title="Review & Mastery"
        purpose="Spaced review resurfaces items exactly when memory needs them. Recall first — reveal only after you commit."
        action="Export deck (CSV)"
        actionHref="/api/review/export"
      />

      {loading ? (
        <div aria-busy="true" aria-label="Loading your review queue">
          <div className="skeleton skeleton-title" />
          <div className="skeleton" style={{ height: 200, borderRadius: 18 }} />
        </div>
      ) : loadError ? (
        <div className="state-card error" role="alert">
          <strong>Your review queue could not be loaded.</strong>
          <p style={{ margin: "6px 0 12px" }}>This is usually temporary. Your schedule is safe.</p>
          <button type="button" className="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      ) : card ? (
        <>
          <section className="panel" aria-label="Today's review">
            <div className="panel-title">
              <h3>Today&rsquo;s review — card {index + 1} of {cards.length}</h3>
              <span className="chip">{card.skill}</span>
            </div>
            <p className="review-why" style={{ margin: "0 0 14px", fontSize: 13, color: "var(--text-tertiary)", fontStyle: "italic" }}>
              Resurfaced because your spaced-review schedule reached its due date — recalling now is what strengthens retention.
            </p>
            <h2 style={{ margin: "0 0 16px", fontSize: 24, lineHeight: 1.35 }}>{card.prompt}</h2>
            {showAnswer ? (
              <section style={{ background: "var(--accent-soft)", borderRadius: "var(--radius-md)", padding: 16, marginBottom: 14 }}>
                <strong style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent-text)" }}>Answer</strong>
                <p style={{ margin: "8px 0 0", lineHeight: 1.6 }}>{card.answer ?? "No saved answer — use this item as a recall prompt and rate your confidence honestly."}</p>
              </section>
            ) : (
              <p className="empty">Say or think your answer before revealing — the effort is the training.</p>
            )}
            {!showAnswer ? (
              <button type="button" className="button" onClick={() => setShowAnswer(true)}>Reveal answer</button>
            ) : (
              <div>
                <p className="subtle" style={{ marginTop: 0 }}>How well did you recall it?</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[[1, "Again"], [3, "Hard"], [4, "Good"], [5, "Easy"]].map(([quality, label]) => (
                    <button key={String(label)} type="button" className={quality === 4 ? "button" : "button secondary"} onClick={() => void rate(Number(quality))}>
                      {String(label)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {message ? <p className="state-card info" style={{ marginTop: 16, marginBottom: 0, padding: "10px 14px" }} role="status">{message}</p> : null}
          </section>
        </>
      ) : (
        <section className="panel" aria-label="Review complete">
          <p className="empty" style={{ margin: 0 }}>
            {index === 0
              ? "Nothing is due for review right now. Your recall schedule will surface the next items automatically — complete an activity to keep building the queue."
              : "Review complete. Every due item has been resurfaced and rescheduled. Come back tomorrow for the next batch."}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <Link className="button" href="/dashboard">Back to dashboard</Link>
            <Link className="button secondary" href="/learn">Continue learning</Link>
          </div>
        </section>
      )}

      {needsAttention.length > 0 ? (
        <section className="panel" aria-label="Needs attention">
          <div className="panel-title"><h3>Needs attention</h3><Link href="/progress">Why these</Link></div>
          {needsAttention.map((m) => (
            <div className="review-item" key={m.skill} style={{ marginBottom: 8 }}>
              <span className="mi-body">
                <strong style={{ textTransform: "capitalize" }}>{m.skill}</strong>
                <small className="rv-why">Weakening — recent evidence scores {m.score}%.</small>
              </span>
              <div className="track" style={{ maxWidth: 140 }} aria-label={`${m.skill} strength ${m.score}%`}><span style={{ width: `${m.score}%` }} /></div>
            </div>
          ))}
        </section>
      ) : null}

      {mastered.length > 0 ? (
        <section className="panel" aria-label="Mastered">
          <div className="panel-title"><h3>Mastered</h3></div>
          {mastered.map((m) => (
            <div className="review-item" key={m.skill} style={{ marginBottom: 8 }}>
              <span className="mi-body">
                <strong style={{ textTransform: "capitalize" }}>{m.skill}</strong>
                <small className="rv-why">Consistently strong — {m.score}% across recent evidence.</small>
              </span>
              <div className="track" style={{ maxWidth: 140 }} aria-label={`${m.skill} strength ${m.score}%`}><span style={{ width: `${m.score}%` }} /></div>
            </div>
          ))}
          <p className="empty" style={{ fontSize: 12.5, margin: "10px 0 0" }}>Mastered items still return occasionally — that is how the schedule keeps them sharp.</p>
        </section>
      ) : null}
    </main>
  );
}
