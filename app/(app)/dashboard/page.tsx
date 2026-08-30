"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { track } from "@/app/lib/track";
import { IconCheck, IconBulb, IconFlag } from "@/app/components/nav-icons";

interface Dash {
  firstName: string;
  level: string;
  levelIndex: number;
  nextLevel: string;
  overallPercent: number;
  week: Array<{ label: string; value: number }>;
  skills: Array<{ label: string; value: number }>;
  reviewDue: number;
  dailyMinutes: number;
  currentLessonId: string | null;
  completedLessons: number;
  totalLessons: number;
  vocabularyWords: number;
}

const LEVEL_NAMES: Record<string, string> = {
  "Pre-A1": "Starter",
  A1: "Beginner",
  A2: "Elementary",
  B1: "Intermediate",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Proficient",
};

const BAND_SKILLS: Record<string, string[]> = {
  "Pre-A1": ["Reading", "Writing", "Listening"],
  A1: ["Reading", "Writing", "Listening"],
  A2: ["Reading", "Writing", "Listening"],
  B1: ["Reading", "Writing", "Listening", "Speaking"],
  B2: ["Reading", "Writing", "Listening", "Speaking"],
  C1: ["Reading", "Writing", "Listening", "Speaking"],
  C2: ["Reading", "Writing", "Listening", "Speaking"],
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/** Structured skills enter the programme at B1 (four-skill rule, Parts 23/85). */
function coreSkills(level: string, skills: Array<{ label: string; value: number }>) {
  const allowed = BAND_SKILLS[level] ?? BAND_SKILLS.B1;
  return allowed.map((label) => ({
    label,
    value: skills.find((s) => s.label.toLowerCase() === label.toLowerCase())?.value ?? 0,
  }));
}

function skillBand(level: string, value: number) {
  if (value >= 85) return level === "C2" ? "C2" : `${level}+`;
  return level;
}

function skillWhy(skill: string) {
  switch (skill.toLowerCase()) {
    case "listening": return "to follow everyday conversations with ease";
    case "reading": return "to handle real texts at your level";
    case "writing": return "to write clear, confident messages";
    case "speaking": return "to speak naturally in real situations";
    default: return "to strengthen your everyday English";
  }
}

interface AccessInfo {
  premium: boolean;
  inTrial: boolean;
  trialExpired: boolean;
  trial: { active: boolean; daysLeft: number; hoursLeft: number; fractionRemaining: number; endsAt?: string };
}

function TrialBanner() {
  const [access, setAccess] = useState<AccessInfo | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((a) => { if (!cancelled) setAccess(a); })
      .catch(() => { /* banner stays hidden */ });
    return () => { cancelled = true; };
  }, []);
  if (!access) return null;
  if (access.inTrial) {
    const days = Math.max(access.trial.daysLeft, 0);
    const trialDay = Math.min(7, Math.max(1, 8 - days));
    return (
      <section className="state-card info" aria-label="Trial status" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 0 }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <strong>Trial day {trialDay} of 7</strong> — every premium feature is open while you explore.
          <div className="track" style={{ marginTop: 8, maxWidth: 320 }}><span style={{ width: `${Math.min(100, Math.max(0, (access.trial.fractionRemaining ?? 1) * 100))}%` }} /></div>
        </div>
        <span className="streak-pill">Ends in {days} day{days === 1 ? "" : "s"}</span>
        <Link href="/plan" className="button secondary" style={{ fontSize: 13 }}>Manage plan</Link>
      </section>
    );
  }
  if (access.trialExpired) {
    return (
      <section className="state-card" aria-label="Trial ended" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <strong style={{ fontSize: 15 }}>Continue your English journey</strong>
          <div className="subtle" style={{ fontSize: 13.5, marginTop: 3 }}>
            Your assessment showed where you are — keep building towards your next checkpoint. Your report and progress are safe.
          </div>
        </div>
        <Link href="/plan" className="button">View plans</Link>
      </section>
    );
  }
  return null;
}

function DashboardSkeleton() {
  return (
    <main id="main-content" className="dash-main" aria-busy="true" aria-label="Loading your dashboard">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: "38%" }} />
      <div className="skeleton" style={{ height: 150, borderRadius: 18 }} />
      <div className="stat-strip">
        {[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 92, borderRadius: 16 }} />)}
      </div>
      <div className="skeleton" style={{ height: 210, borderRadius: 18 }} />
    </main>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("dashboard_entered");
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error ?? "Unable to load your dashboard.");
        if (!cancelled) setData(payload as Dash);
      })
      .catch((reason) => {
        if (cancelled) return;
        if (String(reason?.message ?? reason).toLowerCase().includes("authentication")) router.push("/auth");
        else setError(reason instanceof Error ? reason.message : "Unable to load your dashboard.");
      });
    return () => { cancelled = true; };
  }, [router]);

  const lesson = useMemo(
    () => (data?.currentLessonId ? ALL_LESSONS.find((l) => l.id === data.currentLessonId) ?? null : null),
    [data],
  );

  const todayPlan = useMemo(() => {
    if (!data) return [];
    const minutes = Math.max(15, data.dailyMinutes || 20);
    const steps: Array<{ key: string; label: string; href: string; minutes: number }> = [
      { key: "listening", label: "Listening", href: "/english-ear", minutes: Math.round(minutes * 0.35) },
      { key: "vocabulary", label: "Vocabulary", href: "/vocabulary", minutes: Math.round(minutes * 0.2) },
      { key: "reading", label: "Reading", href: "/reading", minutes: Math.round(minutes * 0.3) },
    ];
    if (data.reviewDue > 0) steps.push({ key: "review", label: "Review", href: "/review", minutes: Math.max(5, Math.round(minutes * 0.15)) });
    return steps;
  }, [data]);

  if (error) {
    return (
      <main id="main-content" className="dash-main">
        <div className="state-card error" role="alert">
          <strong>We could not load your dashboard.</strong>
          <p style={{ margin: "6px 0 12px" }}>{error} Your progress is safe — this is usually a temporary connection issue.</p>
          <button type="button" className="button" onClick={() => { setError(null); router.refresh(); }}>Try again</button>
        </div>
      </main>
    );
  }

  if (!data) return <DashboardSkeleton />;

  const skills = coreSkills(data.level, data.skills);
  const levelName = LEVEL_NAMES[data.level] ?? data.level;
  const isNewLearner = data.completedLessons === 0 && data.overallPercent === 0;

  return (
    <main id="main-content" className="dash-main">
      {/* 1 — Welcome + current level (Part 18) */}
      <header className="dash-header">
        <div>
          <h1>{greeting()}, {data.firstName}</h1>
          <p className="subtle">
            Your English journey continues at <strong>{data.level} · {levelName}</strong>
            {data.nextLevel && data.nextLevel !== data.level ? <> — next milestone <strong>{data.nextLevel}</strong></> : null}.
          </p>
        </div>
      </header>

      <TrialBanner />

      {isNewLearner ? (
        /* New learner: one clear first step (Parts 71/92) */
        <section className="nba-card" aria-label="Your first step">
          <span className="nba-eyebrow">Welcome to English Wizard</span>
          <h2>Start by checking your English</h2>
          <p>A short adaptive assessment finds your level across reading, writing and listening — then everything on this dashboard is built around you.</p>
          <div className="nba-actions">
            <Link href="/diagnostic" className="button nba-btn">Check my level</Link>
            <Link href="/learning-path" className="button nba-btn-ghost">Preview the journey</Link>
          </div>
        </section>
      ) : (
        <>
          {/* 2 — Next best action (Part 20) */}
          <section className="nba-card" aria-label="Your next best step">
            <span className="nba-eyebrow">Your next best step</span>
            <h2>{lesson ? `Continue: ${lesson.title}` : "Check my level"}</h2>
            <p>
              {lesson
                ? `${lesson.mission.charAt(0).toUpperCase()}${lesson.mission.slice(1)} — ${skillWhy(String(lesson.skill))}.`
                : "A short adaptive assessment keeps your level and recommendations accurate."}
            </p>
            <div className="nba-meta">
              {lesson ? <span>{lesson.level} · {lesson.skill}</span> : <span>Adaptive · {data.level} standard</span>}
              <span>≈ 12 minutes</span>
            </div>
            <div className="nba-actions">
              <Link href={lesson ? `/learn?lesson=${encodeURIComponent(lesson.id)}` : "/diagnostic"} className="button nba-btn">
                {lesson ? "Continue" : "Check my level"}
              </Link>
              <Link href="/learning-path" className="button nba-btn-ghost">View my journey</Link>
            </div>
          </section>

          {/* 3 + 4 — Today's plan (Part 21) and current path (Part 22) */}
          <div className="grid-two-wide">
            <section className="panel" aria-label="Today's learning plan">
              <div className="panel-title"><h3>Today — {todayPlan.reduce((s, p) => s + p.minutes, 0)} minutes</h3><Link href="/learn">Open lessons</Link></div>
              <ol className="plan-timeline" style={{ listStyle: "none" }}>
                {todayPlan.map((step, i) => (
                  <li className="plan-step" key={step.key}>
                    <span className="ps-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                    <span className="ps-label">{step.label}<small>{skillWhy(step.label.replace("Review", "review").replace("Listening", "listening").replace("Vocabulary", "vocabulary").replace("Reading", "reading")).replace(/^to /, "Builds ")}</small></span>
                    <span className="ps-time">{step.minutes} min</span>
                  </li>
                ))}
              </ol>
              <Link className="button" style={{ alignSelf: "flex-start" }} href="/learn">Start today&rsquo;s plan</Link>
            </section>

            <section className="panel" aria-label="Your journey so far">
              <div className="panel-title"><h3>Your journey</h3><Link href="/learning-path">Full journey</Link></div>
              <div className="level-path">
                {["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].map((lv) => {
                  const idx = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].indexOf(lv);
                  return (
                    <div key={lv} className={`level-step ${idx <= data.levelIndex ? "reached" : ""} ${lv === data.level ? "current" : ""}`}>
                      <span className="lv-dot">{lv}</span>
                      <small>{LEVEL_NAMES[lv]}</small>
                    </div>
                  );
                })}
              </div>
              <p className="subtle" style={{ fontSize: 13.5, margin: "12px 0 0" }}>
                Current focus: <strong>{lesson?.title ?? "your next lesson"}</strong>. Complete the {data.level} units to unlock the {data.nextLevel} checkpoint.
              </p>
            </section>
          </div>

          {/* 5 — Skill progress (Parts 23/24) */}
          <div className="grid-two-wide">
            <section className="panel" aria-label="Skill progress">
              <div className="panel-title"><h3>Skill progress</h3><Link href="/progress">Progress &amp; insights</Link></div>
              {skills.map((s) => (
                <div className="skill-row" key={s.label}>
                  <span>{s.label}</span>
                  <div className="bar" role="img" aria-label={`${s.label}: ${s.value}%`}><i style={{ width: `${Math.max(4, s.value)}%` }} /></div>
                  <strong>{skillBand(data.level, s.value)}</strong>
                </div>
              ))}
              <p className="empty" style={{ fontSize: 12.5, margin: "8px 0 0" }}>
                {data.levelIndex <= 2
                  ? "Structured speaking begins at B1 — your listening, reading and writing are building the foundations now."
                  : "Skill bands update as you complete lessons and checkpoints."}
              </p>
            </section>

            <section className="panel" aria-label="Progress towards your next level">
              <div className="panel-title"><h3>Progress towards {data.nextLevel}</h3><Link href="/progress">Details</Link></div>
              <div className="big-progress" style={{ border: 0, padding: 0, background: "transparent", boxShadow: "none" }}>
                <div className="bp-band">
                  <span className="bp-level" style={{ fontSize: 40 }}>{data.level}</span>
                  <span className="bp-arrow" aria-hidden="true">→</span>
                  <span className="bp-target" style={{ fontSize: 24 }}>{data.nextLevel}</span>
                </div>
                <div className="track" aria-label={`Overall progress ${data.overallPercent}%`}><span style={{ width: `${data.overallPercent}%` }} /></div>
                <p className="subtle" style={{ margin: 0, fontSize: 13 }}>
                  <strong>{data.overallPercent}%</strong> of the way from {data.level} to {data.nextLevel}, measured across every completed activity.
                </p>
                <ul className="insight-list" style={{ marginTop: 4 }}>
                  <li><IconCheck size={14} /> {data.completedLessons} of {data.totalLessons} lessons completed</li>
                  <li><IconCheck size={14} /> {data.vocabularyWords.toLocaleString()} words learned</li>
                  {data.reviewDue > 0 ? <li><IconFlag size={14} /> {data.reviewDue} item{data.reviewDue === 1 ? "" : "s"} ready for review</li> : null}
                </ul>
              </div>
            </section>
          </div>

          {/* 6 — Continue learning + Next milestone (Parts 17/78) */}
          <div className="grid-two-wide">
            <section className="panel" aria-label="Continue learning">
              <div className="panel-title"><h3>Continue learning</h3><Link href="/worlds">Worlds &amp; missions</Link></div>
              {lesson ? (
                <a className="mission-row" href={`/learn?lesson=${encodeURIComponent(lesson.id)}`}>
                  <span className="mi-num" aria-hidden="true">▶</span>
                  <span className="mi-body">
                    <strong>{lesson.title}</strong>
                    <small>{lesson.mission}</small>
                  </span>
                  <span className="mi-meta">{lesson.level}</span>
                </a>
              ) : (
                <p className="empty">Finish your assessment to unlock personalised recommendations.</p>
              )}
            </section>

            <section className="panel milestone-card" aria-label="Next milestone">
              <span className="milestone-medal" aria-hidden="true"><IconFlag size={18} /></span>
              <div>
                <strong>Next milestone</strong>
                <p className="subtle" style={{ margin: "4px 0 8px" }}>
                  Reach <strong>{Math.max(70, Math.min(90, data.overallPercent + 15))}%</strong> average skill strength to unlock your {data.nextLevel} checkpoint.
                </p>
                <Link className="link-arrow" href="/pathways">View checkpoints →</Link>
              </div>
            </section>
          </div>

          {/* 7 — AI support (calm, optional) */}
          <section className="panel buddy-card" aria-label="AI support">
            <div className="panel-title"><h3>Your English tutor</h3><span className="beta-pill">Beta</span></div>
            <div className="buddy-row">
              <span className="buddy-avatar" aria-hidden="true"><IconBulb /></span>
              <p>Ask for clearer explanations, examples at your {data.level} level, or feedback on anything you have written — the tutor knows where you are in your journey.</p>
            </div>
            <Link className="button secondary buddy-btn" href="/teacher-help">Open Teacher AI</Link>
          </section>
        </>
      )}
    </main>
  );
}
