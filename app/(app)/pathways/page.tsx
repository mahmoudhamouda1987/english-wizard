"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";

type Selection = { pathway: string; domain?: string; track?: string; target?: string; selectedAt: string };

/**
 * Tests & Exams (Assess) — assessment infrastructure only: LevelCheck (Full
 * Check) placement and the full mock exam. Product-level preparation lives in
 * its own destination under Learning Paths, never here — and preparation
 * never implies official certification.
 */
export default function PathwaysPage() {
  const [selected, setSelected] = useState<Selection | null>(null);

  useEffect(() => {
    fetch("/api/pathways", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.selected) setSelected(payload.selected);
      })
      .catch(() => { /* the active-pathway card simply stays hidden */ });
  }, []);

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Assess"
        title="Tests & Exams"
        purpose="Two honest instruments: the Full Check placement that discovers your level, and full mock exams that rehearse the real thing. Product practice lives in Learning Paths."
      />

      <div className="exam-hero-grid" style={{ marginTop: 8 }}>
        <section className="exam-card" aria-label="Full Check placement">
          <span className="ex-eyebrow">Full Check · Placement</span>
          <h3>Discover your level</h3>
          <p>
            The adaptive Full Check places you on the CEFR scale across reading, writing and listening —
            40 questions, about 30 minutes, with a personalised report and Student ID at the end.
          </p>
          <div className="ex-cta">
            <Link className="button" href="/diagnostic">Start Full Check →</Link>
          </div>
        </section>

        <section className="exam-card" aria-label="Full mock exam">
          <span className="ex-eyebrow">Full mock · Rehearsal</span>
          <h3>Rehearse the real exam</h3>
          <p>
            A complete mock covering reading, writing and speaking with a transparent band estimate against
            CEFR descriptors — the calm, honest rehearsal before any official test day.
          </p>
          <div className="ex-cta">
            <Link className="button" href="/pathways/mock">Take the mock exam →</Link>
          </div>
        </section>
      </div>

      {selected && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title"><h2>Active pathway</h2><span>Selected {new Date(selected.selectedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span></div>
          <p><strong>{selected.pathway.replaceAll("_", " ")}</strong>{selected.domain ? ` · ${selected.domain.replaceAll("_", " ")}` : ""}{selected.track ? ` · ${selected.track.replaceAll("_", " ")}` : ""}{selected.target ? ` · target ${selected.target}` : ""}</p>
          <p className="subtle" style={{ margin: 0, fontSize: 13 }}>
            Product-level practice — General, Business, Fluency, IELTS and Cambridge — lives under <Link href="/learning-path">Learning Paths</Link>.
          </p>
        </section>
      )}

      {!selected && (
        <p className="subtle" style={{ margin: "18px 0 0", fontSize: 13.5 }}>
          Product-level practice — General, Business, Fluency, IELTS and Cambridge — lives under <Link href="/learning-path">Learning Paths</Link>.
        </p>
      )}
    </main>
  );
}
