"use client";

import { useCallback, useEffect, useState } from "react";
import { speakText, speechFriendly } from "@/src/domain/tts";
import { ExamTimer, clearExamTimer } from "@/app/components/exam-timer";
import type { IeltsVariant, BandTarget, ObjectiveItem, ReadingSet, WritingTask, SpeakingCard } from "@/src/domain/ielts";

const BANDS = [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] as const;
const SKILLS = ["reading", "listening", "writing", "speaking"] as const;
const STAGES = ["teach", "guided", "timed", "module-test"] as const;
const SKILL_ICONS: Record<string, string> = { reading: "📖", listening: "🎧", writing: "✍️", speaking: "🗣️" };
const STAGE_LABELS: Record<string, string> = { teach: "Teach", guided: "Guided", timed: "Timed", "module-test": "Module Test" };

interface Plan { variant: IeltsVariant; band: BandTarget; modules: Array<{ id: string; skill: string; stage: string; title: string; minutes: number; description: string }> }

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
      setError("");
      fetch(`/api/exams/ielts?variant=${variant}&band=${band}`).then(async (r) => { const data = await r.json(); setPlan(data.plan); setStep("dashboard"); setLoading(false); })
        .catch(() => { setError("Failed to load IELTS plan."); setLoading(false); });
    }
  }, [variant, band]);

  function selectVariant(v: IeltsVariant) { setVariant(v); setStep("band"); }

  if (step === "variant") return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{ fontSize: 48 }}>🎯</span>
        <p className="eyebrow" style={{ marginTop: 8 }}>IELTS Preparation</p>
        <h1 style={{ fontSize: 28, margin: "8px 0" }}>Choose your IELTS pathway</h1>
        <p className="subtle" style={{ maxWidth: 520, margin: "0 auto" }}>Both paths share Listening and Speaking — they differ in Reading and Writing formats. Internal estimates only — never official IELTS scores.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 24 }}>
        <button onClick={() => selectVariant("ACADEMIC")} className="button" style={{ padding: 0, textAlign: "left", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, #1e3a5f22, #4a90d922)", padding: "28px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 36 }}>📚</span>
              <div>
                <strong style={{ fontSize: 18 }}>IELTS Academic</strong>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>University & higher education</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, opacity: 0.85 }}>University-level texts, data description, formal essays. For students applying to English-speaking universities.</p>
          </div>
        </button>
        <button onClick={() => selectVariant("GENERAL")} className="button" style={{ padding: 0, textAlign: "left", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, #2d4a3e22, #5cb85c22)", padding: "28px 26px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 36 }}>🏢</span>
              <div>
                <strong style={{ fontSize: 18 }}>IELTS General Training</strong>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Work & immigration</div>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, opacity: 0.85 }}>Workplace letters, notices, opinion essays. For migration, work experience, or non-academic training programmes.</p>
          </div>
        </button>
      </div>
    </main>
  );

  if (step === "band") return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <p className="eyebrow">IELTS {variant}</p>
        <h1 style={{ fontSize: 26, margin: "6px 0" }}>Select your target band score</h1>
        <p className="subtle" style={{ maxWidth: 460, margin: "0 auto" }}>Each band adjusts the difficulty of practice materials and the number of timed modules.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))", gap: 10, marginTop: 24, maxWidth: 600, margin: "24px auto 0" }}>
        {BANDS.map((b) => {
          const isHigh = b >= 7;
          const isMid = b >= 5.5 && b < 7;
          const bg = isHigh ? "#f8717122" : isMid ? "#fbbf2422" : "#38bdf822";
          return <button key={b} onClick={() => setBand(b)} className="button secondary" style={{ fontSize: 22, padding: "16px 0", borderRadius: 12, background: bg, fontWeight: 700 }}>{b}</button>;
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20, fontSize: 12.5, opacity: 0.6 }}>
        <span>🔵 Foundation (4–5)</span><span>🟡 Intermediate (5.5–6.5)</span><span>🔴 Advanced (7–9)</span>
      </div>
    </main>
  );

  if (step === "dashboard" && plan) return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 40 }}>🎯</span>
        <p className="eyebrow" style={{ marginTop: 4 }}>IELTS {variant} · Band {band}</p>
        <h1 style={{ fontSize: 26, margin: "6px 0" }}>Your preparation plan</h1>
        <p className="subtle" style={{ maxWidth: 460, margin: "0 auto" }}>Follow each skill in order: Teach → Guided → Timed → Module Test.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {SKILLS.map((skill) => (
          <div key={skill} className="panel" style={{ padding: 0, overflow: "hidden", borderRadius: 14 }}>
            <div style={{ background: "linear-gradient(135deg, #1e3a5f11, #4a90d911)", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 24 }}>{SKILL_ICONS[skill]}</span>
                <strong style={{ fontSize: 16, textTransform: "capitalize" }}>{skill}</strong>
              </div>
            </div>
            <div style={{ padding: "12px 16px", display: "grid", gap: 8 }}>
              {STAGES.map((stage) => {
                const mod = plan.modules.find((m) => m.skill === skill && m.stage === stage);
                if (!mod) return null;
                return (
                  <button key={mod.id} onClick={() => { setActiveModule({ id: mod.id, skill, stage }); setStep("module"); }} className="button secondary" style={{ textAlign: "left", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span><span style={{ opacity: 0.5, fontSize: 12, marginRight: 6 }}>{STAGE_LABELS[stage]}</span>{mod.title.replace(/^[A-Z][a-z]+ — /, "")}</span>
                    <span className="subtle" style={{ fontSize: 12, flexShrink: 0 }}>{mod.minutes} min</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );

  if (step === "module" && activeModule) return <ModuleRunner variant={variant!} band={band!} skill={activeModule.skill} stage={activeModule.stage} onBack={() => { clearExamTimer(activeModule.id); setStep("dashboard"); }} onComplete={() => setStep("dashboard")} />;

  return <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px" }}>{loading ? <p>Loading…</p> : <p>{error || "Select a variant and band to begin."}</p>}</main>;
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
    fetch(`/api/exams/ielts?variant=${variant}&band=${band}&skill=${skill}&stage=${stage}`).then(async (r) => { const data = await r.json(); if (data.items) setItems(data.items); if (data.passage) setPassage(data.passage); if (data.title) setTitle(data.title); if (data.minutes) setMinutes(data.minutes); if (data.task) setWritingTask(data.task); if (data.card) setSpeakingCard(data.card); if (data.script) setScript(data.script); })
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
    const tips: Record<string, string[]> = { reading: ["Skim for main idea, then scan for keywords", "Always locate evidence — never rely on assumption", "Distractors paraphrase — match meaning, not exact words"], listening: ["Predict word types before audio plays (noun? number? name?)", "Listen for self-corrections — final answer is scored", "Spelling and digits are exact — write what you hear"], writing: ["Task 1: overview first, then comparisons with specific data", "Task 2: position your view, support with two body paragraphs", "Linkers must be precise — avoid overusing 'and'"], speaking: ["Extend to 3-4 sentences with one concrete detail", "Self-correcting shows examiners you monitor grammar", "Fluency beats complexity — stumbles from hard words cost marks"] };
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 40 }}>{SKILL_ICONS[skill]}</span>
        <p className="eyebrow" style={{ marginTop: 4 }}>IELTS {variant} · Band {band} · {stage === "teach" ? "Teach" : "Guided"}</p>
        <h1 style={{ fontSize: 26, margin: "6px 0" }}>{skill} — {stage === "teach" ? "Understanding the skill" : "Guided walkthrough"}</h1>
      </div>
      <section className="panel" style={{ marginTop: 18, padding: 24, lineHeight: 1.7, borderRadius: 14 }}>
        <p style={{ fontSize: 15.5, margin: "0 0 14px" }}>{descriptions[skill]}</p>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, margin: 0 }}>{(tips[skill] ?? []).map((tip, i) => <li key={i} style={{ marginBottom: 6 }}>{tip}</li>)}</ul>
      </section>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button className="button" onClick={onBack}>← Back to plan</button>
      </div>
    </main>;
  }

  if (result) return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 40 }}>{SKILL_ICONS[skill]}</span>
        <p className="eyebrow" style={{ marginTop: 4 }}>IELTS {variant} · {stage}</p>
        <h1 style={{ fontSize: 26, margin: "6px 0" }}>Results</h1>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        <div className="panel" style={{ padding: 22, textAlign: "center" }}>
          <div style={{ fontSize: 42, fontWeight: 700, color: result.band >= 7 ? "#f87171" : result.band >= 5.5 ? "#fbbf24" : "#38bdf8" }}>{result.band}</div>
          <p style={{ margin: "4px 0 0", fontSize: 14 }}>Estimated band · Score: {result.percent}%</p>
          <p className="subtle" style={{ margin: "2px 0 0", fontSize: 12 }}>Internal estimate, not official IELTS</p>
        </div>
        {result.feedback.length > 0 && <div className="panel" style={{ padding: 20 }}><h3 style={{ margin: "0 0 8px" }}>📋 Feedback</h3><ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>{result.feedback.slice(0, 6).map((f, i) => <li key={i}>{f}</li>)}</ul></div>}
        {result.recommendations.length > 0 && <div className="panel" style={{ padding: 20 }}><h3 style={{ margin: "0 0 8px" }}>🎯 Next steps</h3><ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.7 }}>{result.recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul></div>}
      </div>
      <div style={{ textAlign: "center", marginTop: 20 }}>
        <button className="button" onClick={onComplete}>← Back to plan</button>
      </div>
    </main>
  );

  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p className="eyebrow">IELTS {variant} · {skill} · {stage}</p>
          <h1 style={{ margin: 0, fontSize: 22 }}>{title || `${skill} practice`}</h1>
        </div>
        {isTimed && <ExamTimer durationMinutes={minutes} attemptKey={`ielts-${variant}-${band}-${skill}-${stage}`} onTimeUp={handleTimeUp} />}
      </div>
      {passage && <section className="panel" style={{ padding: 22, lineHeight: 1.75, marginBottom: 18, fontSize: 14.5, borderRadius: 14 }}><p style={{ margin: "0 0 12px", fontWeight: 700 }}>{title}</p><div style={{ whiteSpace: "pre-wrap" }}>{passage}</div></section>}
      {script && <details style={{ marginBottom: 18 }}><summary style={{ cursor: "pointer", fontWeight: 700, padding: "8px 0" }}>🎧 Full listening script</summary><pre style={{ whiteSpace: "pre-wrap", fontSize: 13.5, lineHeight: 1.65, marginTop: 8 }}>{script}</pre></details>}
      {skill === "writing" && writingTask && <div className="panel" style={{ padding: 22, marginBottom: 18, borderLeft: "4px solid #fb923c", borderRadius: 14 }}><h3 style={{ margin: "0 0 10px" }}>✍️ {writingTask.title}</h3><p style={{ margin: "0 0 12px", lineHeight: 1.6 }}>{writingTask.prompt}</p>{writingTask.data && <pre style={{ fontSize: 13, whiteSpace: "pre-wrap", background: "#f5f7fa", padding: 12, borderRadius: 8 }}>{writingTask.data.join("\n")}</pre>}<textarea value={writingText} onChange={(e) => setWritingText(e.target.value)} rows={10} placeholder="Write your response here…" style={{ width: "100%", marginTop: 12, fontSize: 14, lineHeight: 1.6, borderRadius: 8, border: "1px solid #d0daf0", padding: 12 }} /><p className="subtle">Word count: {writingText.trim().split(/\s+/).filter(Boolean).length} / {writingTask.minWords}</p></div>}
      {skill === "speaking" && speakingCard && <div className="panel" style={{ padding: 22, marginBottom: 18, borderLeft: "4px solid #a855f7", borderRadius: 14 }}><h3 style={{ margin: "0 0 10px" }}>🗣️ Cue card</h3><p style={{ margin: "0 0 8px", fontWeight: 600 }}>{speakingCard.topic}</p><ul style={{ margin: "0 0 16px", paddingLeft: 20, lineHeight: 1.7 }}>{speakingCard.prompts.map((p, i) => <li key={i}>{p}</li>)}</ul><button className="button secondary" onClick={() => { speakText(`Describe ${speakingCard.topic.toLowerCase()}.`, { lang: "en-GB", gender: "female" }); }}>🔊 Play prompt aloud</button></div>}
      {items.length > 0 && <div className="panel" style={{ padding: 22, marginBottom: 18, borderRadius: 14 }}><h3 style={{ margin: "0 0 14px" }}>📝 Questions ({items.length})</h3><div style={{ display: "grid", gap: 14 }}>{items.map((item, idx) => <div key={item.id} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <p style={{ margin: "0 0 8px", fontWeight: 600, fontSize: 14.5 }}>{idx + 1}. {item.prompt}</p>
        {item.kind === "mcq" && item.options && <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{item.options.map((opt) => <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))} className={`button secondary${answers[item.id] === opt ? " selected" : ""}`} style={{ padding: "8px 16px", fontSize: 13 }}>{opt}</button>)}</div>}
        {item.kind === "gap" && <input value={answers[item.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [item.id]: e.target.value }))} placeholder="Type your answer…" style={{ padding: "10px 14px", fontSize: 14, borderRadius: 8, border: "1px solid #d0daf0", width: "100%" }} />}
        {item.kind === "tfng" && item.options && <div style={{ display: "flex", gap: 8 }}>{item.options.map((opt) => <button key={opt} onClick={() => setAnswers((a) => ({ ...a, [item.id]: opt }))} className={`button secondary${answers[item.id] === opt ? " selected" : ""}`} style={{ padding: "8px 16px" }}>{opt}</button>)}</div>}
      </div>)}</div></div>}
      {error && <p role="alert" style={{ color: "#a53b3b", padding: "10px 16px", background: "#fef2f2", borderRadius: 8 }}>{error}</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button className="button" onClick={() => { void submit(); }} disabled={loading}>{loading ? "Submitting…" : "Submit answers"}</button>
        <button className="button secondary" onClick={onBack}>← Back</button>
      </div>
    </main>
  );
}
