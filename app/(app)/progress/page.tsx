"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { IconCheck } from "@/app/components/nav-icons";
import { track } from "@/app/lib/track";

type MasteryRecord = { skill: string; score: number; level: string };

interface DashboardData {
  firstName: string;
  level: string;
  levelIndex: number;
  nextLevel: string;
  overallPercent: number;
  series: number[];
  skills: Array<{ label: string; value: number }>;
  reviewDue: number;
  dailyMinutes: number;
  completedLessons: number;
  totalLessons: number;
  vocabularyWords: number;
}

interface ProgressState { completedLessonIds: string[]; mastery: MasteryRecord[]; errors: unknown[] }

const LEVEL_NAMES: Record<string, string> = {
  "Pre-A1": "Starter", A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper-Intermediate", C1: "Advanced", C2: "Proficient",
};

/** Progress & Insights — the professional progress centre (Part 27). */
export default function ProgressPage() {
  const [dash, setDash] = useState<DashboardData | null>(null);
  const [state, setState] = useState<ProgressState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("progress_entered");
    let cancelled = false;
    Promise.all([
      fetch("/api/dashboard", { cache: "no-store" }).then(async (r) => {
        const p = await r.json();
        if (!r.ok) throw new Error(p.error ?? "Unable to load progress.");
        return p as DashboardData;
      }),
      fetch("/api/learner-state", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([d, s]) => {
        if (cancelled) return;
        setDash(d);
        setState(s?.state ?? null);
      })
      .catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load progress."); });
    return () => { cancelled = true; };
  }, []);

  const bestSkill = useMemo(() => {
    if (!dash?.skills.length) return null;
    return [...dash.skills].sort((a, b) => b.value - a.value)[0] ?? null;
  }, [dash]);

  const insights = useMemo(() => {
    if (!dash) return [] as string[];
    const list: string[] = [];
    if (bestSkill && bestSkill.value > 0) list.push(`${bestSkill.label} is your strongest skill at ${bestSkill.value}% — keep it warm with regular practice.`);
    if (dash.completedLessons > 0) list.push(`You have completed ${dash.completedLessons} of ${dash.totalLessons} lessons in your programme.`);
    if (dash.vocabularyWords > 0) list.push(`${dash.vocabularyWords.toLocaleString()} words learned so far — vocabulary grows fastest when reviewed, not just met once.`);
    if (dash.reviewDue > 0) list.push(`${dash.reviewDue} item${dash.reviewDue === 1 ? " is" : "s are"} due for review today.`);
    if (dash.series.length >= 3) {
      const trend = dash.series[dash.series.length - 1] - dash.series[0];
      if (trend > 0) list.push(`Your average performance has improved by ${trend} points over your recent sessions.`);
      else if (trend === 0) list.push("Your performance has held steady across recent sessions.");
      else list.push("A slightly quieter stretch — consistency matters more than intensity.");
    }
    return list;
  }, [dash, bestSkill]);

  if (error) {
    return (
      <main id="main-content" className="dash-main">
        <PageHeader eyebrow="Evidence, not guesswork" title="Progress & Insights" purpose="Your level, skills and study pattern — measured from what you actually do." />
        <div className="state-card error" role="alert">
          <strong>Your progress could not be loaded.</strong>
          <p style={{ margin: "6px 0 12px" }}>{error}</p>
          <button type="button" className="button" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Evidence, not guesswork"
        title="Progress & Insights"
        purpose="Your level, skills and study pattern — measured from what you actually do, not points collected."
        action="Assessment history"
        actionHref="/portfolio"
      />

      {!dash ? (
        <div aria-busy="true" aria-label="Loading your progress">
          <div className="skeleton skeleton-title" />
          <div className="skeleton" style={{ height: 160, borderRadius: 18 }} />
          <div className="skeleton" style={{ height: 220, borderRadius: 18 }} />
        </div>
      ) : (
        <>
          <div className="insight-hero">
            {/* Overall CEFR level band (Part 27) */}
            <section className="big-progress" aria-label="Overall CEFR level">
              <p className="review-section-title" style={{ margin: 0 }}>Overall CEFR level</p>
              <div className="bp-band">
                <span className="bp-level">{dash.level}</span>
                {dash.nextLevel !== dash.level ? <><span className="bp-arrow" aria-hidden="true">→</span><span className="bp-target">{dash.nextLevel}</span></> : null}
              </div>
              <p className="subtle" style={{ margin: 0 }}>{LEVEL_NAMES[dash.level] ?? dash.level} — measured across every skill and activity.</p>
              <div>
                <div className="hero-progress-head"><span>Progress towards {dash.nextLevel}</span><strong>{dash.overallPercent}%</strong></div>
                <div className="track" aria-label={`${dash.overallPercent}% towards ${dash.nextLevel}`}><span style={{ width: `${dash.overallPercent}%` }} /></div>
              </div>
              <p className="empty" style={{ fontSize: 12.5, margin: 0 }}>Level claims are evidence-gated: they move when your assessed performance moves.</p>
            </section>

            {/* Study pattern */}
            <section className="panel" aria-label="Study pattern" style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <div className="panel-title" style={{ marginBottom: 0 }}><h3>Study pattern</h3></div>
              <ul className="insight-list">
                <li><IconCheck size={14} /> {dash.completedLessons} of {dash.totalLessons} lessons completed</li>
                <li><IconCheck size={14} /> {dash.vocabularyWords.toLocaleString()} words learned</li>
                <li><IconCheck size={14} /> {dash.dailyMinutes} minutes planned per study day</li>
                <li><IconCheck size={14} /> {dash.reviewDue} review item{dash.reviewDue === 1 ? "" : "s"} currently due</li>
                {state ? <li><IconCheck size={14} /> {state.errors.length} recorded errors being tracked for correction</li> : null}
              </ul>
              <Link className="button secondary" style={{ justifySelf: "start" }} href="/learning-path">Continue the journey</Link>
            </section>
          </div>

          {/* Skill mastery */}
          <section className="panel" aria-label="Skill mastery">
            <div className="panel-title"><h3>Skill mastery</h3><Link href="/worlds">Practise by world</Link></div>
            {dash.skills.filter((s) => s.label !== "Speaking" || dash.levelIndex >= 3).map((s) => (
              <div className="skill-row" key={s.label}>
                <span>{s.label}</span>
                <div className="bar" role="img" aria-label={`${s.label} mastery ${s.value}%`}><i style={{ width: `${Math.max(4, s.value)}%` }} /></div>
                <strong>{s.value}%</strong>
              </div>
            ))}
            {dash.levelIndex < 3 ? (
              <p className="empty" style={{ fontSize: 12.5, margin: "8px 0 0" }}>
                Structured speaking joins your programme at B1 — your current levels build the foundations it needs.
              </p>
            ) : null}
            {state?.mastery.length ? (
              <>
                <p className="review-section-title">Finer skill records</p>
                {state.mastery.slice(0, 6).map((m) => (
                  <div className="mastery-row" key={m.skill}>
                    <span style={{ textTransform: "capitalize" }}>{m.skill}</span>
                    <div className="track"><span style={{ width: `${m.score}%` }} /></div>
                    <strong>{m.score}%</strong>
                  </div>
                ))}
              </>
            ) : null}
          </section>

          {/* Learning trend */}
          {dash.series.length >= 2 ? (
            <section className="panel" aria-label="Learning trend">
              <div className="panel-title"><h3>Learning trend</h3><span>Average performance across recent sessions</span></div>
              <svg viewBox="0 0 320 150" className="linechart" role="img" aria-label="Performance trend line chart">
                {[25, 50, 75, 100].map((g) => (
                  <line key={g} x1="10" x2="310" y1={140 - (g / 100) * 120} y2={140 - (g / 100) * 120} stroke="var(--border-subtle)" strokeWidth="1" />
                ))}
                <path
                  d={dash.series.map((v, i) => `${i ? "L" : "M"}${(10 + (i * 300) / (dash.series.length - 1)).toFixed(1)},${(140 - (v / 100) * 120).toFixed(1)}`).join(" ")}
                  fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round"
                />
                <circle cx={10 + (300 * (dash.series.length - 1)) / (dash.series.length - 1)} cy={140 - (dash.series[dash.series.length - 1] / 100) * 120} r="4" fill="var(--accent-primary)" />
              </svg>
            </section>
          ) : null}

          {/* Insights — only from real data (Part 27) */}
          {insights.length > 0 ? (
            <section className="panel" aria-label="Insights">
              <div className="panel-title"><h3>What your data says</h3></div>
              <ul className="insight-list">
                {insights.map((line) => <li key={line}><IconCheck size={14} /> {line}</li>)}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
