"use client";

import { useEffect, useState } from "react";
import { UpgradeModal } from "@/app/components/upgrade-modal";

type Readiness = { ready: boolean; missing: string[] };
type DomainSummary = { id: string; label: string; blurb: string; trackCount: number; tracks: Array<{ id: string; label: string }> };
type Catalog = {
  generalEnglish: { pathway: string; description: string };
  ielts: ExamPathwayView;
  cambridge: ExamPathwayView;
  professional: { domains: DomainSummary[] };
};
type ExamPathwayView = {
  exam: string;
  skills: string[];
  practiceTypes: string[];
  scoreModel: string;
  disclaimer: string;
  readinessCriteria: string[];
  readiness: Readiness;
  variants?: string[];
  bands?: number[];
  qualifications?: string[];
};
type Selection = { pathway: string; domain?: string; track?: string; target?: string; selectedAt: string };

export default function PathwaysPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [selected, setSelected] = useState<Selection | null>(null);
  const [domain, setDomain] = useState("BUSINESS");
  const [track, setTrack] = useState("WORKPLACE_COMMUNICATION");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [premium, setPremium] = useState<boolean | null>(null);
  const [gate, setGate] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/access", { cache: "no-store" }).then((r) => r.json()).then((a) => setPremium(Boolean(a.premium))).catch(() => setPremium(true));
  }, []);

  useEffect(() => {
    fetch("/api/pathways", { cache: "no-store" })
      .then((r) => r.json())
      .then((payload) => {
        if (payload.catalog) {
          setCatalog(payload.catalog);
          setSelected(payload.selected ?? null);
        } else {
          setMessage(payload.error ?? "Sign in to choose your learning pathway.");
        }
      })
      .catch(() => setMessage("Unable to load pathways."));
  }, []);

  async function select(pathway: string, extra: Record<string, string> = {}) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/pathways", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pathway, ...extra }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to save selection.");
      setSelected(payload.selection);
      setMessage("Pathway saved. Your daily missions now follow this path.");
      const refreshed = await fetch("/api/pathways", { cache: "no-store" }).then((r) => r.json());
      if (refreshed.catalog) setCatalog(refreshed.catalog);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save selection.");
    } finally {
      setBusy(false);
    }
  }

  function readinessLabel(readiness: Readiness) {
    return readiness.ready ? "Ready" : `Building: ${readiness.missing.slice(0, 3).join(", ")}`;
  }

  return (
    <main id="main-content" style={{ maxWidth: 980, margin: "0 auto", padding: 40 }}><section className="panel" style={{marginBottom:24,padding:22,display:"flex",justifyContent:"space-between",gap:14,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 4px"}}>📝 Take the mock exam</h2><p className="subtle" style={{margin:0}}>Reading, writing and speaking in ten minutes — transparent band estimate against CEFR descriptors.</p></div><a className="button" href="/pathways/mock">Start mock →</a></section>
      <p className="eyebrow">Learning pathways</p>
      <h1>Choose the English path that fits your life</h1>
      <p className="muted">
        Each pathway keeps its own readiness evidence, separate from general English mastery. Preparation never implies official certification.
      </p>
      {message && <p role="status" className="state-card">{message}</p>}
      {selected && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title"><h2>Active pathway</h2><span>{new Date(selected.selectedAt).toLocaleDateString()}</span></div>
          <p><strong>{selected.pathway.replaceAll("_", " ")}</strong>{selected.domain ? ` · ${selected.domain.replaceAll("_", " ")}` : ""}{selected.track ? ` · ${selected.track.replaceAll("_", " ")}` : ""}{selected.target ? ` · target ${selected.target}` : ""}</p>
        </section>
      )}
      {catalog && (
        <>
          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-title"><h2>General English</h2><span>Default</span></div>
            <p>{catalog.generalEnglish.description}</p>
            <button className="button secondary" disabled={busy} onClick={() => select("GENERAL_ENGLISH")}>Follow general mastery</button>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-title"><h2>IELTS preparation</h2><span>{readinessLabel(catalog.ielts.readiness)}</span></div>
            <p>Skills: {catalog.ielts.skills.join(" · ")}</p>
            <p className="muted">{catalog.ielts.scoreModel}</p>
            <button className="button" onClick={() => { if (premium === false) setGate("EXAM_PATHWAY"); else window.location.href = "/pathways/ielts"; }}>Open IELTS pathway →</button>
            <p style={{ fontSize: 13, opacity: 0.75 }}>{catalog.ielts.disclaimer}</p>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-title"><h2>Cambridge preparation</h2><span>{readinessLabel(catalog.cambridge.readiness)}</span></div>
            <p>Skills: {catalog.cambridge.skills.join(" · ")}</p>
            <p className="muted">{catalog.cambridge.scoreModel}</p>
            <button className="button" onClick={() => { if (premium === false) setGate("EXAM_PATHWAY"); else window.location.href = "/pathways/cambridge"; }}>Open Cambridge pathway →</button>
            <p style={{ fontSize: 13, opacity: 0.75 }}>{catalog.cambridge.disclaimer}</p>
          </section>

          <section className="panel" style={{ marginTop: 20 }}>
            <div className="panel-title"><h2>Professional English</h2><span>28 lessons</span></div>
            <p className="subtle">28 professional English lessons covering emails, meetings, presentations, negotiations, leadership, and executive communication — B1 through C2, each with scenes, exercises, and vocabulary.</p>
            <a className="button" href="/learning-path">Open Professional English curriculum →</a>
          </section>
        </>
      )}
      <UpgradeModal open={Boolean(gate)} onClose={() => setGate(null)} feature="EXAM_PATHWAY" />
    </main>
  );
}
