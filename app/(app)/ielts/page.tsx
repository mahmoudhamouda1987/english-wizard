"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { BAND_TARGETS } from "@/src/domain/ielts";
import { ProductGate } from "@/app/components/product-gate";

/**
 * IELTS — separate premium product (2.0 contract, Parts 58–71).
 * Identity: target band, exam strategy, simulation, readiness.
 * The full course flow lives at /ielts/course (Academic/General Training,
 * target band, four skills, teach → guided → timed → module test → mock).
 */

type Dashboard = { level?: string; overallPercent?: number };

const SKILLS = [
  { key: "reading", label: "Reading", outcome: "Finish passages with time to check answers — skimming, scanning, paraphrase spotting." },
  { key: "listening", label: "Listening", outcome: "Catch numbers, spellings and distractors first time — the recording plays once in the exam." },
  { key: "writing", label: "Writing", outcome: "Task 1 and Task 2 written to visible band criteria — no black-box scoring." },
  { key: "speaking", label: "Speaking", outcome: "Part 1, 2 and 3 with examiner-style flow — one minute of prep, two of talk." },
] as const;

function IeltsProductPageContent() {
  const [level, setLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Dashboard | null) => {
        if (cancelled) return;
        setLevel(d?.level ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("We could not load your level just now. Your IELTS work is still one tap away.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const gateIdx = level ? ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].indexOf(level) : -1;
  const gated = gateIdx >= 0 && gateIdx < 3;

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Products · IELTS"
        title="IELTS Preparation"
        purpose="A complete preparation course — Academic and General Training, every skill, taught then timed — calibrated to your target band."
        action="Open your course"
        actionHref="/ielts/course"
      />

      <section className="panel" style={{ padding: 24, marginBottom: 18 }}>
        {loading ? (
          <p className="subtle">Reading your level…</p>
        ) : gated ? (
          <>
            <h2 style={{ marginTop: 0 }}>IELTS coursework starts at B1</h2>
            <p style={{ lineHeight: 1.65 }}>
              Your placement puts you at {level}. The exam course works best when the language base is solid, so your General
              English path is building toward B1 first — and every session counts twice: once for your level, once for your band.
              When you reach B1, the course unlocks automatically.
            </p>
            <Link className="button" href="/general-english">Continue toward B1</Link>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>Ready to work toward your band</h2>
            <p style={{ lineHeight: 1.65 }}>
              {level
                ? `Your current level is ${level}. The course adapts module difficulty to your target band — choose Academic or General Training, set the band, and the plan builds itself.`
                : "Take LevelCheck to place yourself, then choose Academic or General Training and set your target band. The plan builds itself from there."}
            </p>
            <Link className="button" href="/ielts/course">Start the course</Link>
          </>
        )}
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 className="eyebrow" style={{ marginBottom: 10 }}>Four skills, one structure</h2>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
          {SKILLS.map((s) => (
            <div key={s.key} className="panel" style={{ padding: 20 }}>
              <strong style={{ fontSize: 16 }}>{s.label}</strong>
              <p className="subtle" style={{ margin: "8px 0 0", lineHeight: 1.6 }}>{s.outcome}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>How a module works</h2>
        <p className="subtle" style={{ lineHeight: 1.65 }}>
          Every skill moves through the same honest sequence — understand it, try it with support, try it against the clock,
          then prove it in a module test. Full mocks replicate the exam structure with single-play listening, exactly like
          test day.
        </p>
        <ol style={{ lineHeight: 2, margin: "12px 0 0", paddingLeft: 20 }}>
          <li><strong>Teach</strong> — the strategy, step by step, with worked examples and common traps.</li>
          <li><strong>Guided</strong> — practice with support while the method becomes habit.</li>
          <li><strong>Timed</strong> — the same skill against the clock, no support.</li>
          <li><strong>Module test</strong> — scored, with criterion-level feedback on writing and speaking.</li>
          <li><strong>Full mock</strong> — complete exam simulation, band estimates, target-gap report.</li>
        </ol>
      </section>

      <section className="panel" style={{ padding: 24, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>Target bands</h2>
        <p className="subtle" style={{ lineHeight: 1.6 }}>
          Set any target from 4.0 to 9.0. Your plan, timing and readiness estimates follow the band — and the target-gap
          report tells you exactly which paper is holding the overall score back.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
          {BAND_TARGETS.map((b) => (
            <span key={b} className="pill" style={{ fontSize: 13, fontWeight: 600 }}>{b.toFixed(1)}</span>
          ))}
        </div>
        <p className="subtle" style={{ marginTop: 14, fontSize: 13 }}>
          Band estimates are English Wizard calculations on original practice material — never official IELTS results.
        </p>
      </section>

      {error && <p role="alert" className="subtle">{error}</p>}

      <section className="panel" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Also in assessment</h2>
        <p className="subtle" style={{ lineHeight: 1.6 }}>
          Full mocks and LevelCheck live in Tests &amp; Exams — products live here, examination infrastructure lives there.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Link className="button secondary" href="/pathways">Tests &amp; Exams</Link>
          <Link className="button secondary" href="/pathways/mock">Full mock</Link>
        </div>
      </section>
    </main>
  );
}


export default function IeltsProductPage() {
  return (
    <ProductGate product="ielts">
      <IeltsProductPageContent />
    </ProductGate>
  );
}
