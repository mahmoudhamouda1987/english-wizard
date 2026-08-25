"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { speakText, speechFriendly } from "@/src/domain/tts";
import { ExamTimer, clearExamTimer } from "@/app/components/exam-timer";
import type { IeltsVariant, BandTarget, ModuleStage, ObjectiveItem, ReadingSet, WritingTask, SpeakingCard } from "@/src/domain/ielts";

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;
const SKILLS = ["reading", "listening", "writing", "speaking"] as const;
const STAGES = ["teach", "guided", "timed", "module-test"] as const;

interface Plan { variant: IeltsVariant; band: BandTarget; modules: Array<{ id: string; skill: string; stage: string; title: string; minutes: number; description: string }> }
interface ModuleResult { skill: string; stage: string; percent: number; band: number }

export default function IeltsPage() {
  const [step, setStep] = useState<"variant" | "band" | "dashboard" | "module">("variant");
  const [variant, setVariant] = useState<IeltsVariant | null>(null);
  const [band, setBand] = useState<BandTarget | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [activeModule, setActiveModule] = useState<{ id: string; skill: string; stage: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (variant && band) {
      setLoading(true);
      fetch(`/api/exams/ielts?variant=${variant}&band=${band}`).then(async (r) => { const data = await r.json(); setPlan(data.plan); setStep("dashboard"); setLoading(false); })
        .catch(() => { setError("Failed to load IELTS plan."); setLoading(false); });
    }
  }, [variant, band]);

  function selectVariant(v: IeltsVariant) { setVariant(v); setStep("band"); }

  if (step === "variant") return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Start IELTS</p>
      <h1>Choose your IELTS pathway</h1>
      <p className="subtle">Both paths share Listening and Speaking — they differ in Reading and Writing formats.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 24 }}>
        <button onClick={() => selectVariant("ACADEMIC")} className="button" style={{ padding: 28, textAlign: "left", fontSize: 16 }}>📚 IELTS Academic<br /><span className="subtle">University-level texts, data description, formal essays.</span></button>
        <button onClick={() => selectVariant("GENERAL")} className="button" style={{ padding: 28, textAlign: "left", fontSize: 16 }}>🏢 IELTS General Training<br /><span className="subtle">Workplace letters, notices, opinion essays.</span></button>
      </div>
    </main>
  );

  if (step === "band") return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Start IELTS {variant}</p>
      <h1>Select your target band score</h1>
      <p className="subtle">Each band adjusts the difficulty of practice materials and the number of timed modules.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 10, marginTop: 24 }}>
        {BANDS.map((b) => <button key={b} onClick={() => setBand(b)} className="button secondary" style={{ fontSize: 20, padding: "14px 0" }}>{b}</button>)}
      </div>
    </main>
  );

  if (step === "dashboard" && plan) return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">IELTS {variant} · Band {band}</p>
      <h1>Your preparation plan</h1>
      <p className="subtle">Follow each skill in order: Teach → Guided → Timed → Module Test.</p>
      {SKILLS.map((skill) => (
        <section key={skill} style={{ marginTop: 28 }}>
          <h2 style={{ textTransform: "capitalize" }}>{skill}</h2>
          <div style={{ display: "grid", gap: 8 }}>
            {STAGES.map((stage) => {
              const mod = plan.modules.find((m) => m.skill === skill && m.stage === stage);
              if (!mod) return null;
              return <button key={mod.id} onClick={() => { setActiveModule({ id: mod.id, skill: mod.stage === "teach" || mod.stage === "guided" ? skill : skill, stage }); setStep("module"); }} className="button secondary" style={{ textAlign: "left", padding: "12px 16px" }}>{mod.title} <span className="subtle">({mod.minutes} min)</span></button>;
            })}
          </div>
        </section>
      ))}
    </main>
  );

  if (step === "module" && activeModule) return <ModuleRunner variant={variant!} band={band!} skill={activeModule.skill} stage={activeModule.stage} onBack={() => { clearExamTimer(activeModule.id); setStep("dashboard"); }} onComplete={() => setStep("dashboard")} />;

  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>{loading ? <p>Loading…</p> : <p>{error || "Select a variant and band to begin."}</p>}</main>;
}

/* ---- Module Runner ---- */

function ModuleRunner({ variant, band, skill, stage, onBack, onComplete }: { variant: IeltsVariant; band: number; skill: string; stage: string; onBack: () => void; onComplete: () => void }) {
  const [items, setItems] = useState<ObjectiveItem[]>([]);
  const [passage, setPassage] = useState("");
  const [title, setTitle] = useState("");
  const [writingTask, setWritingTask] = useState<WritingTask | null>(null);
  const [speakingCard, setSpeakingCard] = useState<SpeakingCard | null>(null);
  const [script, setScript] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingText, setWritingText] = useState("");
  const [result, setResult] = useState<{ percent: number; band: number; feedback: string[]; recommendations: string[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTimed] = useState(stage === "timed" || stage === "module-test");
  const [minutes, setMinutes] = useState(15);

  useEffect(() => {
    if (stage === "teach" || stage === "guided") return;
    fetch(`/api/exams/ielts?variant=${variant}&band=${band}&skill=${skill}&stage=${stage}`).then(async (r) => { const data = await r.json(); if (data.items) setItems(data.items); if (data.passage) setPassage(data.passage); if (data.title) setTitle(data.title); if (data.minutes) setMinutes(data.minutes); if (data.task) { setWritingTask(data.task); setWritingTask(data.task); } if (data.card) setSpeakingCard(data.card); if (data.script) setScript(data.script); })
      .catch(() => setError("Failed to load module content."));
  }, [variant, band, skill, stage]);

  const handleTimeUp = useCallback(() => { void submit(); }, []);

  async function submit() {
    setLoading(true);
    const body: Record<string, unknown> = { variant, band: String(band), skill };
    if (skill === "writing") body.writingText = writingText;
    else if (skill === "speaking") body.speakingRubric = { fluencyCoherence: "okay", lexicalResource: "okay", grammaticalRange: "okay", pronunciation: "okay" };
    else body.answers = answers;
    try {
      const r = await fetch("/api/exams/ielts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await r.json();
      setResult({ percent: Object.values(data.skillPercents)[0] as number, band: data.overallBand, feedback: data.feedback, recommendations: data.recommendations });
    } catch { setError("Submission failed."); }
    setLoading(false);
  }

  if (stage === "teach" || stage === "guided") {
    const descriptions: Record<string, string> = { reading: "IELTS reading: locate information, recognise paraphrase traps, answer MCQ and gap-fill questions.", listening: "IELTS listening: predict answers from question stems, catch corrected information, spell accurately.", writing: "IELTS writing: structure paragraphs precisely, use data vocabulary (Task 1) or argue logically (Task 2).", speaking: "IELTS speaking: extend answers with examples, use discourse markers, self-correct naturally." };
    return <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">IELTS {variant} · Band {band} · {stage === "teach" ? "Teach" : "Guided"}</p>
      <h1>{skill} — {stage === "teach" ? "Understanding the skill" : "Guided walkthrough"}</h1>
      <section className="panel" style={{ marginTop: 18, padding: 20, lineHeight: 1.7 }}><p>{descriptions[skill] ?? descriptions.reading}</p>
        {skill === "reading" && <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.9 }}><li>Skim for main idea, then scan for keywords</li><li>Always locate evidence — never rely on assumption</li><li>Distractors paraphrase — match meaning, not exact words</li></ul>}
        {skill === "listening" && <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.9 }}><li>Predict word types before audio plays (noun? number? name?)</li><li>Listen for self-corrections — final answer is scored</li><li>Spelling and digits are exact — write what you hear</li></ul>}
        {skill === "writing" && <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.9 }}><li>Task 1: overview first, then comparisons with specific data</li><li>Task 2: position your view, support with two body paragraphs</li><li>Linkers must be precise — avoid overusing "and"</li></ul>}
        {skill === "speaking" && <ul style={{ marginTop: 8, paddingLeft: 20, lineHeight: 1.9 }}><li>Extend to 3-4 sentences with one concrete detail</li><li>Self-correcting shows examiners you monitor grammar</li><li>Fluency beats complexity — stumbles from hard words cost marks</li></ul>}
      </section>
      <button className="button" style={{ marginTop: 18 }} onClick={onBack}>← Back to plan</button>
    </main>;
  }

  if (result) return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">IELTS {variant} · {stage}</p>
      <h1>Results</h1>
      <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <div className="panel" style={{ padding: 20 }}><h2 style={{ margin: 0 }}>Score: {result.percent}%</h2><p className="subtle">Estimated band ≈ {result.band} (internal estimate, not official IELTS)</p></div>
        {result.feedback.length > 0 && <div className="panel" style={{ padding: 20 }}><h3 style={{ margin: "0 0 8px" }}>Feedback</h3><ul style={{ margin: 0, paddingLeft: 20 }}>{result.feedback.slice(0, 6).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
        {result.recommendations.length > 0 && <div className="panel" style={{ padding: 20 }}><h3 style={{ margin: "0 0 8px" }}>Next steps</h3><ul style={{ margin: 0, paddingLeft: 20 }}>{result.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul></div>}
      </div>
      <button className="button" style={{ marginTop: 18 }} onClick={onComplete}>← Back to plan</button>
    </main>
  );

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><p className="eyebrow">IELTS {variant} · {skill} · {stage}</p><h1 style={{ margin: 0 }}>{title || `${skill} practice`}</h1></div>
        {isTimed && <ExamTimer durationMinutes={minutes} attemptKey={`ielts-${variant}-${band}-${skill}-${stage}`} onTimeUp={handleTimeUp} />}
      </div>
      {passage && <section className="panel" style={{ padding: 20, lineHeight: 1.75, marginBottom: 18, fontSize: 14.5 }}><p style={{ margin: "0 0 12px", fontWeight: 700 }}>{title}</p><div style={{ whiteSpace: "pre-wrap" }}>{passage}</div></section>}
      {script && <details style={{ marginBottom: 18 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Full listening script (tap after attempting)</summary><pre style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.65, marginTop: 8 }}>{script}</pre></details>}
      {skill === "writing" && writingTask && <div className="panel" style={{ padding: 20, marginBottom: 18 }}><h3 style={{ margin: "0 0 8px" }}>{writingTask.title}</h3><p style={{ margin: "0 0 12px" }}>{writingTask.prompt}</p>{writingTask.data && <pre style={{ fontSize: 13, whiteSpace: "pre-wrap", background: "#f5f7fa", padding: 10, borderRadius: 8 }}>{writingTask.data.join("\n")}</pre>}<textarea value={writingText} onChange={(e) => setWritingText(e.target.value)} rows={10} placeholder="Write your response here…" style={{ width: "100%", marginTop: 12, fontSize: 14, lineHeight: 1.6 }} /><p className="subtle">Word count: {writingText.trim().split(/\s+/).filter(Boolean).length} / {writingTask.minWords}</p></div>}
      {skill === "speaking" && speakingCard && <div className="panel" style={{ padding: 20, marginBottom: 18 }}><h3 style={{ margin: "0 0 8px" }}>Cue card</h3><p style={{ margin: "0 0 8px" }}>{speakingCard.topic}</p><ul style={{ margin: "0 0 16px", paddingLeft: 20 }}>{speakingCard.prompts.map((p, i) => <li key={i}>{p}</li>)}</ul><button className="button secondary" onClick={() => { speakText(`Describe ${speakingCard.topic.toLowerCase()}.`, { lang: "en-GB", gender: "female" }); }}>Play prompt aloud</button></div>}
      {items.length > 0 && <div className="panel" style={{ padding: 20, marginBottom: 18 }}><div style={{ display: "grid", gap: 14 }}>{items.map((item) => <div key={item.id}>
        <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{item.prompt}</p>
        {item.kind === "mcq" && item.options && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{item.options.map((opt) => <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))} className={`button secondary${answers[item.id] === opt ? " selected" : ""}`} style={{ padding: "8px 14px", fontSize: 13 }}>{opt}</button>)}</div>}
        {item.kind === "gap" && <input value={answers[item.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))} placeholder="Type your answer…" style={{ padding: "8px 12px", fontSize: 14 }} />}
        {item.kind === "tfng" && item.options && <div style={{ display: "flex", gap: 8 }}>{item.options.map((opt) => <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))} className={`button secondary${answers[item.id] === opt ? " selected" : ""}`} style={{ padding: "8px 14px" }}>{opt}</button>)}</div>}
      </div>)}</div></div>}
      {error && <p role="alert" style={{ color: "#a53b3b" }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="button" onClick={() => { void submit(); }} disabled={loading}>{loading ? "Submitting…" : "Submit answers"}</button>
        <button className="button secondary" onClick={onBack}>← Back</button>
      </div>
    </main>
  );
}
