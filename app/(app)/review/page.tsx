"use client";

import { useEffect, useState } from "react";

type ReviewCard = { id: string; skill: string; prompt: string; answer: string | null; interval_days: number; repetitions: number };

export default function ReviewPage() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/review", { cache: "no-store" });
        const payload = await response.json();
        if (cancelled) return;
        if (response.ok) setCards(payload.cards ?? []);
        else setMessage(payload.error ?? "Unable to load review.");
      } catch {
        if (!cancelled) setMessage("Unable to load review.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function rate(quality: number) {
    const card = cards[index];
    if (!card) return;
    const response = await fetch("/api/review", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cardId: card.id, quality }) });
    const payload = await response.json();
    if (!response.ok) { setMessage(payload.error ?? "Unable to save review."); return; }
    setMessage(`Next review in about ${payload.intervalDays} day${payload.intervalDays === 1 ? "" : "s"}.`);
    setShowAnswer(false);
    setIndex((value) => value + 1);
  }

  const card = cards[index];
  if (loading) return <main id="main-content" style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}><p className="eyebrow">Review</p><h1>Loading your review queue…</h1></main>;
  if (!card) return <main id="main-content" style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}><p className="eyebrow">Review</p><h1>{cards.length === 0 ? "Nothing is due right now." : "Review complete."}</h1><p className="subtle">Your recall schedule is persisted and will surface the next due items automatically.</p>{message && <p>{message}</p>}<div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap" }}><a className="button" href="/dashboard">Back to dashboard →</a><a className="button secondary" href="/api/review/export">Export deck (Anki CSV)</a></div></main>;

  return <main id="main-content" style={{ maxWidth: 760, margin: "0 auto", padding: "56px 24px" }}>
    <p className="eyebrow">Spaced Review · {card.skill}</p>
    <h1>{card.prompt}</h1>
    {showAnswer ? <section className="panel" style={{ marginTop: 20 }}><h2>Answer</h2><p>{card.answer ?? "No saved answer — use this item as a recall prompt."}</p></section> : <p className="subtle">Recall first. Reveal the answer only when you have committed to a response.</p>}
    {!showAnswer ? <button className="button" onClick={() => setShowAnswer(true)}>Reveal answer</button> : <div style={{ display: "grid", gap: 10, marginTop: 20 }}><p className="subtle">How well did you recall it?</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[[1,"Again"],[3,"Hard"],[4,"Good"],[5,"Easy"]].map(([quality,label]) => <button key={String(quality)} className="button button-secondary" onClick={() => void rate(Number(quality))}>{String(label)}</button>)}</div></div>}
    {message && <p style={{ marginTop: 18 }}>{message}</p>}
  </main>;
}
