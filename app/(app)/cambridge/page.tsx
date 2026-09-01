"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { QUALIFICATIONS } from "@/src/domain/cambridge";
import { ProductGate } from "@/app/components/product-gate";

/**
 * Cambridge — separate premium product (2.0 contract, Parts 72–76).
 * Identity: qualification, exam format, prediction, readiness.
 * Course flow (benchmarks, papers, readiness) lives at /cambridge/course.
 */

type Dashboard = { level?: string; overallPercent?: number };

const QUAL_LIST = Object.values(QUALIFICATIONS);

function CambridgeProductPageContent() {
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
        setError("We could not load your level just now. The qualifications are still one tap away.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const levelIdx = level ? ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].indexOf(level) : -1;

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Products · Cambridge"
        title="Cambridge English Qualifications"
        purpose="A2 Key to C2 Proficiency — original practice built on the official exam format, with honest scale estimates."
        action="Choose your qualification"
        actionHref="/cambridge/course"
      />

      <section className="panel" style={{ padding: 24, marginBottom: 18 }}>
        {loading ? (
          <p className="subtle">Reading your level…</p>
        ) : level && levelIdx >= 0 ? (
          <>
            <h2 style={{ marginTop: 0 }}>Your level: {level}</h2>
            <p style={{ lineHeight: 1.65 }}>
              Cambridge qualifications map directly onto the CEFR scale. At {level}, the qualification below is your
              stretch target and the one at your level is where you could test today — the readiness check in the course
              will tell you which.
            </p>
            <Link className="button" href="/cambridge/course">Open the course</Link>
          </>
        ) : (
          <>
            <h2 style={{ marginTop: 0 }}>Place yourself first</h2>
            <p style={{ lineHeight: 1.65 }}>
              Take LevelCheck and the platform will match you to the right qualification — then the course trains every
              paper of it.
            </p>
            <Link className="button" href="/diagnostic">Take LevelCheck</Link>
          </>
        )}
      </section>

      <section style={{ marginBottom: 18 }}>
        <h2 className="eyebrow" style={{ marginBottom: 10 }}>The qualifications</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {QUAL_LIST.map((q) => {
            const atLevel = level && q.cefr === level;
            return (
              <div key={q.id} className="panel" style={{ padding: 20, border: atLevel ? "2px solid var(--accent-primary)" : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span className="pill" style={{ fontWeight: 700 }}>{q.cefr}</span>
                  <strong style={{ fontSize: 16 }}>{q.name}</strong>
                </div>
                <p className="subtle" style={{ margin: 0, lineHeight: 1.6 }}>
                  {q.papers.length} papers · {q.papers.map((p) => p.label).join(", ")}
                </p>
                {atLevel && <p className="pill" style={{ marginTop: 10, display: "inline-block" }}>Matches your current level</p>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginBottom: 18 }}>
        <h2 style={{ marginTop: 0 }}>How preparation works</h2>
        <ol style={{ lineHeight: 2, margin: 0, paddingLeft: 20 }}>
          <li><strong>Benchmarks</strong> — vocabulary, grammar, reading and listening checks place you inside the qualification.</li>
          <li><strong>Paper practice</strong> — original exercises per paper, at exam task format.</li>
          <li><strong>Writing and speaking tasks</strong> — structured production with visible criteria.</li>
          <li><strong>Readiness check</strong> — a full diagnostic pass with an honest scale estimate.</li>
        </ol>
        <p className="subtle" style={{ marginTop: 14, fontSize: 13 }}>
          Scale estimates are English Wizard calculations on original material — never official Cambridge results.
        </p>
      </section>

      {error && <p role="alert" className="subtle">{error}</p>}

      <section className="panel" style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Also in assessment</h2>
        <p className="subtle" style={{ lineHeight: 1.6 }}>
          Mocks and LevelCheck live in Tests &amp; Exams; your qualification evidence lands in Portfolio &amp; Evidence.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <Link className="button secondary" href="/pathways">Tests &amp; Exams</Link>
          <Link className="button secondary" href="/portfolio">Portfolio &amp; Evidence</Link>
        </div>
      </section>
    </main>
  );
}


export default function CambridgeProductPage() {
  return (
    <ProductGate product="cambridge">
      <CambridgeProductPageContent />
    </ProductGate>
  );
}
