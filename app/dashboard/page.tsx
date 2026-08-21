"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface LearnerState {
  learnerId: string;
  currentLessonId: string | null;
  completedLessonIds: string[];
  lessonHistory: Array<{ lessonId: string; status: "not_started" | "in_progress" | "completed"; attemptCount: number }>;
  mastery: Array<{ skill: string; score: number; level: string }>;
  errors: Array<{ id: string; severity: string; description: string; occurrences: number }>;
  nextAction: { type: string; id: string; reason?: string; priority?: string } | null;
}

interface Profile {
  displayName: string;
  nativeLanguage: string;
  englishDna: { overallLevel: string; strengths: string[]; focusAreas: string[] };
  dailyMinutes: number;
}

interface Analytics {
  snapshots: Array<{
    capabilityId: string;
    baselineScore: number | null;
    currentScore: number | null;
    scoreDelta: number | null;
    evidenceCount: number;
    correctRate: number;
    transferRate: number;
  }>;
  retention14d: number;
}

interface SessionPlan {
  id?: string;
  type?: string;
  missionId?: string;
  activities?: string[];
  createdAt?: string;
}

const links: Record<string, string> = {
  Dashboard: "/dashboard",
  LearningPath: "/learning-path",
  Worlds: "/worlds",
  Lessons: "/learn",
  ListeningLab: "/conversation",
  EnglishEar: "/english-ear",
  ReadingEngine: "/reading",
  SayItBetter: "/say-it-better",
  Pathways: "/pathways",
  SpeakingCoach: "/speaking",
  Review: "/review",
  Practice: "/practice",
  Vocabulary: "/vocabulary",
  Pronunciation: "/pronunciation",
  Progress: "/progress",
  Mistakes: "/mistakes",
  Achievements: "/achievements",
  Community: "/community",
  Settings: "/settings",
};

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function DashboardPage() {
  const router = useRouter();
  const [state, setState] = useState<LearnerState | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [plans, setPlans] = useState<SessionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/learner-state", { cache: "no-store" }).then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error ?? "Unable to load learner state.");
        return payload.state as LearnerState;
      }),
      fetch("/api/profile", { cache: "no-store" }).then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error ?? "Unable to load profile.");
        return payload.profile as Profile | null;
      }),
      fetch("/api/analytics", { cache: "no-store" }).then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error ?? "Unable to load analytics.");
        return payload as Analytics;
      }),
      fetch("/api/session-plan", { cache: "no-store" }).then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error ?? "Unable to load today's plan.");
        return payload.plans as SessionPlan[];
      }),
    ])
      .then(([learnerState, learnerProfile, learnerAnalytics, sessionPlans]) => {
        setState(learnerState);
        setProfile(learnerProfile);
        setAnalytics(learnerAnalytics);
        setPlans(sessionPlans);
      })
      .catch((reason) => {
        if (String(reason?.message).includes("Authentication required")) {
          router.push("/auth");
        } else {
          setError(reason instanceof Error ? reason.message : "Unable to load your dashboard.");
        }
      });
  }, [router]);

  const completed = state?.completedLessonIds.length ?? 0;
  const total = state?.lessonHistory.length ?? 0;
  const mastery = useMemo(() => {
    const scores = state?.mastery.map((item) => item.score) ?? [];
    return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  }, [state]);
  const recentPlan = plans[0] ?? null;
  const opportunity = state?.errors[0] ?? null;
  const strongestGrowth = useMemo(() => {
    const withGrowth = analytics?.snapshots.filter((item) => item.scoreDelta !== null) ?? [];
    return [...withGrowth].sort((a, b) => (b.scoreDelta ?? -Infinity) - (a.scoreDelta ?? -Infinity))[0] ?? null;
  }, [analytics]);

  return (
    <main id="main-content" className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">✦</div>
          <div><strong>English</strong><strong>Wizard</strong></div>
        </div>
        <nav aria-label="Primary navigation">
          {Object.entries(links).map(([label, href]) => (
            <a className={label === "Dashboard" ? "nav-item active" : "nav-item"} href={href} key={label}>
              {label.replace(/([A-Z])/g, " $1").trim()}
            </a>
          ))}
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Your English command center</p>
            <h1>Good morning{profile?.displayName ? `, ${profile.displayName}` : ""} 👋</h1>
            <p className="subtle">The Wizard chooses what matters next from your saved learning evidence.</p>
          </div>
          <a className="button secondary" href="/learn">Continue learning</a>
        </header>

        {error && <div className="state-card error" role="alert">{error}</div>}
        {!state && !error && <div className="state-card">Loading your learner profile…</div>}

        {state && (
          <>
            <div className="stats-grid">
              <article><span>Current level</span><strong>{profile?.englishDna?.overallLevel ?? "Not assessed"}</strong><small>From your latest diagnostic</small></article>
              <article><span>Lessons completed</span><strong>{completed}</strong><small>{total ? `of ${total}` : "No curriculum loaded"}</small></article>
              <article><span>Observed mastery</span><strong>{mastery === null ? "—" : `${mastery}%`}</strong><small>Across observed skills</small></article>
              <article><span>14-day retention</span><strong>{analytics ? `${Math.round(analytics.retention14d * 100)}%` : "—"}</strong><small>Recent evidence window</small></article>
            </div>

            <div className="content-grid">
              <section className="panel hero-panel">
                <div>
                  <p className="eyebrow">Today&rsquo;s mission</p>
                  <h2>{recentPlan?.missionId ? pretty(recentPlan.missionId) : state.currentLessonId ?? "Build your English DNA"}</h2>
                  <p className="subtle">
                    {recentPlan?.activities?.length
                      ? `Plan: ${recentPlan.activities.map(pretty).join(" → ")}.`
                      : profile?.englishDna?.focusAreas?.length
                        ? `Focus next: ${profile.englishDna.focusAreas.join(", ")}.`
                        : "Complete the diagnostic to build your evidence-backed learning path."}
                  </p>
                </div>
                <a className="button" href={state.currentLessonId ? `/learn?lesson=${encodeURIComponent(state.currentLessonId)}` : "/diagnostic"}>
                  {state.currentLessonId ? "Continue journey →" : "Take diagnostic →"}
                </a>
              </section>

              <section className="panel">
                <div className="panel-title"><h3>Next best action</h3><span>{state.nextAction?.priority ?? "Evidence-driven"}</span></div>
                <p><strong>{state.nextAction?.id ? pretty(state.nextAction.id) : "Diagnostic"}</strong></p>
                <p className="subtle">{state.nextAction?.reason ?? (state.nextAction?.type ? `Selected because your current state calls for ${pretty(state.nextAction.type).toLowerCase()}.` : "Your next action will appear after assessment evidence is available.")}</p>
                {opportunity && <p><strong>Latest signal:</strong> {opportunity.description} <span className="subtle">({opportunity.occurrences} occurrence{opportunity.occurrences === 1 ? "" : "s"})</span></p>}
              </section>
            </div>

            <section className="panel">
              <div className="panel-title"><h3>Your English DNA</h3><span>{profile?.dailyMinutes ?? 20} min/day</span></div>
              <div className="stats-grid">
                <article><span>Overall</span><strong>{profile?.englishDna?.overallLevel ?? "—"}</strong><small>Estimated, evidence-based</small></article>
                <article><span>Strengths</span><strong className="small-value">{profile?.englishDna?.strengths?.join(" · ") || "Building evidence"}</strong></article>
                <article><span>Focus areas</span><strong className="small-value">{profile?.englishDna?.focusAreas?.join(" · ") || "Building evidence"}</strong></article>
                <article><span>Strongest growth</span><strong className="small-value">{strongestGrowth ? `${pretty(strongestGrowth.capabilityId)} +${strongestGrowth.scoreDelta}` : "Collecting evidence"}</strong></article>
              </div>
            </section>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-title"><h3>Learning path</h3><span>{completed} completed</span></div>
                <div className="path-row">
                  {state.lessonHistory.slice(0, 8).map((lesson) => (
                    <div className={`path-step ${lesson.status}`} key={lesson.lessonId}>
                      <div className="dot">{lesson.status === "completed" ? "✓" : "·"}</div>
                      <small>{lesson.lessonId}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-title"><h3>Recent evidence</h3><span>{analytics?.snapshots.length ?? 0} capabilities</span></div>
                {(analytics?.snapshots ?? []).slice(0, 5).map((snapshot) => (
                  <div className="panel-title" key={snapshot.capabilityId}>
                    <span>{pretty(snapshot.capabilityId)}</span>
                    <strong>{snapshot.currentScore ?? "—"}%</strong>
                  </div>
                ))}
                {!analytics?.snapshots.length && <p className="empty">Your evidence history will appear here as you learn.</p>}
              </section>
            </div>

            <section className="panel">
              <div className="panel-title"><h3>Quick quests</h3><span>Choose the right depth</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
                {[
                  ["Quick Quest", "5–10 min", "/practice"],
                  ["Standard Journey", "15–25 min", "/learning-path"],
                  ["Deep Study", "30–60 min", "/learn"],
                  ["Boss Mission", "20–45 min", "/worlds"],
                ].map(([name, duration, href]) => (
                  <a className="panel" style={{ textDecoration: "none" }} href={href} key={name}>
                    <strong>{name}</strong><br /><span className="subtle">{duration}</span>
                  </a>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-title"><h3>Learning tools</h3><span>One clear next step, deeper tools underneath</span></div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a className="button secondary" href="/worlds">Explore Worlds & Missions</a>
                <a className="button secondary" href="/conversation">1-minute Listening Lab</a>
                <a className="button secondary" href="/english-ear">English Ear</a>
                <a className="button secondary" href="/reading">Reading Engine</a>
                <a className="button secondary" href="/say-it-better">Say It Better</a>
                <a className="button secondary" href="/speaking">Speaking Coach</a>
                <a className="button secondary" href="/review">Spaced Review</a>
                <a className="button secondary" href="/mistakes">Review mistakes</a>
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}
