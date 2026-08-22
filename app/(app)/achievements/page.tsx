"use client";

import { PageHero } from "@/app/components/page-hero";

import { useEffect, useState } from "react";

const badges = [
  { id: "first-lesson", title: "First Lesson", description: "Complete your first lesson." },
  { id: "three-lessons", title: "Getting Momentum", description: "Complete three lessons." },
  { id: "five-skills", title: "Skill Explorer", description: "Record mastery evidence for five skills." },
  { id: "diagnostic", title: "English DNA", description: "Complete the diagnostic." },
];

type LearnerStateSummary = { completedLessonIds?: string[]; mastery?: unknown[] };
type ProfileSummary = { englishDna?: { generatedAt?: string } };

export default function AchievementsPage() {
  const [state, setState] = useState<LearnerStateSummary | null>(null);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [certId, setCertId] = useState<string | null>(null);
  const [certBusy, setCertBusy] = useState(false);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    fetch("/api/certificate").then((r) => r.json()).then((p) => { if (p.certificate?.id) setCertId(p.certificate.id); }).catch(() => undefined);
  }, []);

  async function issueCertificate() {
    setCertBusy(true);
    setCertError("");
    try {
      const r = await fetch("/api/certificate", { method: "POST" });
      const p = await r.json();
      if (!r.ok) { setCertError(p.error ?? "Unable to issue certificate."); return; }
      setCertId(p.id);
    } finally {
      setCertBusy(false);
    }
  }

  useEffect(() => {
    const id = localStorage.getItem("english-wizard-learner-id");
    if (!id) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/learner-state?learnerId=${id}`).then((r) => r.json()),
      fetch(`/api/profile?learnerId=${id}`).then((r) => r.json()),
    ]).then(([s, p]) => {
      if (cancelled) return;
      setState(s.state);
      setProfile(p.profile);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unlocked = (id: string) =>
    id === "first-lesson"
      ? (state?.completedLessonIds?.length ?? 0) >= 1
      : id === "three-lessons"
        ? (state?.completedLessonIds?.length ?? 0) >= 3
        : id === "five-skills"
          ? (state?.mastery?.length ?? 0) >= 5
          : Boolean(profile?.englishDna?.generatedAt);

  return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: 48 }}>
      <PageHero icon="🏆" title="Achievements & Certificates" sub="Milestones, badges and your verifiable CEFR certificate." />
      <div style={{ display: "grid", gap: 12, marginTop: 24 }}>
        {badges.map((b) => (
          <section className="panel" key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 18 }}>
              <div>
                <h2>{b.title}</h2>
                <p>{b.description}</p>
              </div>
              <strong>{unlocked(b.id) ? "Unlocked ✓" : "Locked"}</strong>
            </div>
          </section>
        ))}
      </div>

      <section className="panel" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2>CEFR certificate</h2>
            <p>Turn your measured evidence into a shareable, verifiable certificate.</p>
          </div>
          {certId ? (
            <a className="button" href={`/certificate/${certId}`}>View my certificate →</a>
          ) : (
            <button className="button" disabled={certBusy} onClick={() => void issueCertificate()}>{certBusy ? "Issuing…" : "Generate certificate"}</button>
          )}
        </div>
        {certError && <p role="alert" className="subtle" style={{ marginTop: 10 }}>{certError}</p>}
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2>Export your review deck</h2>
            <p>Take your spaced-repetition cards anywhere — imports straight into Anki or any CSV flashcard app.</p>
          </div>
          <a className="button secondary" href="/api/review/export">Download CSV</a>
        </div>
      </section>
    </main>
  );
}
