"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { WORLDS_V2, worldsForLevel } from "@/src/domain/worlds-curriculum";
import type { CEFRLevel } from "@/src/domain/curriculum";
import { track } from "@/app/lib/track";
import { ProductGate } from "@/app/components/product-gate";

/** Single source of truth for level: the platform dashboard payload (Part 105). */
interface DashboardData {
  level: string;
  nextLevel: string;
  overallPercent: number;
  streak: number;
  completedLessons: number;
  skills: Array<{ label: string; value: number }>;
}

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

/** Part 18 skill rule: Reading, Writing and Listening train at every level; Speaking joins the core journey at B1. */
const SKILL_COLUMNS: Array<{ skill: string; fromIndex: number }> = [
  { skill: "Reading", fromIndex: 0 },
  { skill: "Writing", fromIndex: 0 },
  { skill: "Listening", fromIndex: 0 },
  { skill: "Speaking", fromIndex: 3 },
];

const FOCUS_STUDIO: Record<string, { href: string; why: string }> = {
  Listening: { href: "/english-ear", why: "English Ear trains exactly this — fast, natural speech, one ear at a time." },
  Reading: { href: "/reading", why: "The Reading Studio meets you at your level and stretches it gently." },
  Writing: { href: "/writing", why: "The Writing studio corrects your own sentences line by line." },
  Speaking: { href: "/pronunciation", why: "Speaking Coach listens to you and rebuilds the sounds that slip." },
  Grammar: { href: "/grammar", why: "The Grammar studio rebuilds the patterns your evidence flags." },
  Vocabulary: { href: "/vocabulary", why: "The Vocabulary studio spaces the words so they stay." },
};

const JOURNEY_SURFACES = [
  { title: "Worlds & Missions", href: "/worlds", why: "Every level is a set of worlds — coherent stories that turn study into things you can actually do." },
  { title: "Lessons", href: "/learn", why: "Guided lessons in sequence, each one tuned to the level you are at right now." },
  { title: "My Journey", href: "/learning-path", why: "See the whole path at once — where you are, what comes next, and why it comes then." },
];

const SKILL_STUDIOS = [
  { title: "English Ear", href: "/english-ear", why: "Train the ear for real, fast, connected speech — the skill classrooms skip." },
  { title: "Scenes", href: "/scenes", why: "Rehearse real situations before they happen, so the real one feels familiar." },
  { title: "Reading Studio", href: "/reading", why: "Read genuine texts at exactly your level, and feel the level rise." },
  { title: "Vocabulary", href: "/vocabulary", why: "Words that stick — spaced review does the remembering for you." },
  { title: "Grammar", href: "/grammar", why: "Patterns rebuilt from your own mistakes, not from a rulebook dump." },
  { title: "Writing", href: "/writing", why: "Write real pieces and get line-by-line correction on your own words." },
  { title: "Thinking in English", href: "/thinking-in-english", why: "Stop translating in your head — build the direct channel." },
];

const PRACTISE_SURFACES = [
  { title: "Conversation", href: "/conversation", why: "Open conversation with a partner that knows your level and pushes it gently." },
  { title: "Role-play", href: "/roleplay", why: "Pressure-test your skills in the situations you are preparing for." },
  { title: "Reality Checkpoints", href: "/checkpoints", why: "Prove what you can do against real-life tasks — evidence, not vibes." },
];

function GeneralEnglishPageContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [authed, setAuthed] = useState(true);

  useEffect(() => {
    track("product_page_opened", { product: "general_english" });
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as DashboardData;
        if (!cancelled) setData(d);
      })
      .catch(() => { if (!cancelled) setAuthed(false); });
    return () => { cancelled = true; };
  }, []);

  /** Level × skills matrix and world counts come straight from the curriculum module — never invented here. */
  const matrix = useMemo(() => {
    return LEVELS.map((level) => {
      const worlds = WORLDS_V2.filter((w) => w.level === level);
      return {
        level,
        worldCount: worlds.length,
        missionCount: worlds.reduce((sum, w) => sum + w.missions.length, 0),
      };
    });
  }, []);

  const currentIndex = data ? Math.max(0, LEVELS.indexOf(data.level as CEFRLevel)) : -1;
  const nextIndex = data ? Math.min(LEVELS.length - 1, currentIndex + 1) : -1;
  const nextLevelUnlocks = useMemo(() => {
    if (nextIndex < 0) return null;
    const level = LEVELS[nextIndex];
    const worlds = worldsForLevel(level);
    if (!worlds.length) return null;
    return {
      level,
      worldCount: worlds.length,
      missionCount: worlds.reduce((sum, w) => sum + w.missions.length, 0),
      sampleTitles: worlds.slice(0, 2).map((w) => w.title),
      speakingJoins: nextIndex === 3,
    };
  }, [nextIndex]);

  const focus = useMemo(() => {
    if (!data?.skills?.length) return null;
    const weakest = [...data.skills].sort((a, b) => a.value - b.value)[0];
    const studio = FOCUS_STUDIO[weakest.label];
    return studio ? { label: weakest.label, ...studio } : null;
  }, [data]);

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Products · General English"
        title="General English"
        purpose="The core language-development programme — Pre-A1 to C2, one connected journey."
        action="Continue your journey"
        actionHref="/worlds"
      />

      {/* Hero strip — where you are, and what the next level unlocks (Parts 107/108). */}
      <section className="ge-hero" aria-label="Your position in General English">
        <div className="panel ge-hero-panel">
          <p className="eyebrow">Where you are</p>
          {data ? (
            <>
              <div className="ge-hero-level">
                <span className="pill">{data.level}</span>
                <p className="ge-hero-line">Your current level across the connected journey.</p>
              </div>
              <div className="ge-progress" role="img" aria-label={`Overall progress ${data.overallPercent} percent`}>
                <div className="ge-progress-track"><div className="ge-progress-fill" style={{ width: `${Math.min(100, Math.max(0, data.overallPercent))}%` }} /></div>
                <span className="ge-progress-label">{data.overallPercent}% overall · {data.completedLessons} lessons completed</span>
              </div>
            </>
          ) : authed ? (
            <p className="subtle">Reading your level…</p>
          ) : (
            <p className="subtle">Sign in and your level, progress and next unlocks appear here — one level, one journey, no guessing.</p>
          )}
        </div>
        <div className="panel ge-hero-panel">
          <p className="eyebrow">What comes next</p>
          {nextLevelUnlocks ? (
            <>
              <p className="ge-hero-line">
                At <strong>{nextLevelUnlocks.level}</strong> you unlock {nextLevelUnlocks.worldCount} new worlds
                {" "}&mdash; {nextLevelUnlocks.sampleTitles.join(" and ")} &mdash; carrying {nextLevelUnlocks.missionCount} missions.
              </p>
              {nextLevelUnlocks.speakingJoins && (
                <p className="ge-hero-line subtle">Speaking also joins the core journey at B1, alongside Reading, Writing and Listening.</p>
              )}
              <Link className="button secondary" href="/worlds">Preview {nextLevelUnlocks.level} worlds</Link>
            </>
          ) : (
            <p className="subtle">Every level opens the next set of worlds and skills. Your next step is marked on the ladder below.</p>
          )}
        </div>
      </section>

      {/* Personalised focus — derived from the same dashboard evidence, no page-local level logic. */}
      {focus && (
        <section className="ge-focus" aria-label="Your current focus">
          <p>
            <strong>Your focus right now: {focus.label}</strong> — {focus.why}
          </p>
          <Link className="link-button" href={focus.href}>Open the studio</Link>
        </section>
      )}

      {/* Where it takes you — the skill rule as a level × skills matrix (Part 18). */}
      <section className="panel" aria-label="Where it takes you">
        <div className="panel-title">
          <h3>Where it takes you</h3>
          <span>Levels × skills, from the live curriculum</span>
        </div>
        <p className="subtle" style={{ margin: "0 0 14px" }}>
          Reading, Writing and Listening train at every level. Speaking joins the core journey at B1 — and the
          world counts below come from the real curriculum, not a promise.
        </p>
        <div className="ge-matrix-scroll">
          <table className="ge-matrix">
            <caption className="sr-only">Skills trained and worlds available at each CEFR level</caption>
            <thead>
              <tr>
                <th scope="col">Level</th>
                {SKILL_COLUMNS.map((col) => <th scope="col" key={col.skill}>{col.skill}</th>)}
                <th scope="col">Worlds</th>
                <th scope="col">Missions</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => {
                const idx = LEVELS.indexOf(row.level);
                const isNow = Boolean(data) && idx === currentIndex;
                const isFuture = Boolean(data) && idx > currentIndex;
                return (
                  <tr key={row.level} data-now={isNow ? "true" : undefined} data-future={isFuture ? "true" : undefined}>
                    <th scope="row">{row.level}{isNow ? <span className="ge-now-tag">you</span> : null}</th>
                    {SKILL_COLUMNS.map((col) => (
                      <td key={col.skill} aria-label={idx >= col.fromIndex ? `${col.skill} trained` : `${col.skill} not yet`}>
                        {idx >= col.fromIndex ? <span className="ge-dot" aria-hidden="true" /> : <span className="ge-dash" aria-hidden="true">—</span>}
                      </td>
                    ))}
                    <td>{row.worldCount}</td>
                    <td>{row.missionCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Product sections — every link is a real surface, every line is the outcome it serves (Part 133). */}
      <section className="panel" aria-label="The journey surfaces">
        <div className="panel-title">
          <h3>The journey</h3>
          <span>One connected programme</span>
        </div>
        <div className="ge-card-grid">
          {JOURNEY_SURFACES.map((s) => (
            <Link key={s.href} className="ge-card" href={s.href}>
              <strong>{s.title}</strong>
              <span>{s.why}</span>
              <em className="ge-card-cta">Open &rarr;</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel" aria-label="Skill studios">
        <div className="panel-title">
          <h3>Skill studios</h3>
          <span>Focused practice, one skill at a time</span>
        </div>
        <div className="ge-card-grid">
          {SKILL_STUDIOS.map((s) => (
            <Link key={s.href} className="ge-card" href={s.href}>
              <strong>{s.title}</strong>
              <span>{s.why}</span>
              <em className="ge-card-cta">Open &rarr;</em>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel" aria-label="Practise surfaces">
        <div className="panel-title">
          <h3>Practise for real</h3>
          <span>Where the skills meet the world</span>
        </div>
        <div className="ge-card-grid">
          {PRACTISE_SURFACES.map((s) => (
            <Link key={s.href} className="ge-card" href={s.href}>
              <strong>{s.title}</strong>
              <span>{s.why}</span>
              <em className="ge-card-cta">Open &rarr;</em>
            </Link>
          ))}
        </div>
      </section>

      {/* Level ladder — current level highlighted; future levels gated with honest language (Part 104). */}
      <section className="panel" aria-label="The level ladder">
        <div className="panel-title">
          <h3>The level ladder</h3>
          <span>Pre-A1 to C2, in order</span>
        </div>
        <ol className="ge-ladder">
          {LEVELS.map((level, idx) => {
            const state = !data ? "neutral" : idx < currentIndex ? "past" : idx === currentIndex ? "current" : "future";
            return (
              <li key={level} className="ge-rung" data-state={state}>
                <span className="ge-rung-code">{level}</span>
                <span className="ge-rung-note">
                  {state === "current" && "Your level now"}
                  {state === "past" && "Behind you — revisit any time"}
                  {state === "future" && "Locked — coming next"}
                  {state === "neutral" && "One step at a time"}
                </span>
              </li>
            );
          })}
        </ol>
        <p className="subtle" style={{ margin: "12px 0 0" }}>
          No level is skipped and none is faked: each one opens when the evidence says you are ready.
        </p>
      </section>
    </main>
  );
}


export default function GeneralEnglishPage() {
  return (
    <ProductGate product="general-english">
      <GeneralEnglishPageContent />
    </ProductGate>
  );
}
