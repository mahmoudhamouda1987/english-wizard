"use client";

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
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow">Milestones</p>
      <h1>Achievements</h1>
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
    </main>
  );
}
