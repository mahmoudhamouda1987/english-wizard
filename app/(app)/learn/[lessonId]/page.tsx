"use client";
import { useEffect, useMemo, useState, use } from "react";
import { lessonBody } from "@/src/domain/lesson-bodies";
import { materialsFor } from "@/src/domain/lesson-materials";
import { speakText } from "@/src/domain/tts";
import { ScenePlayer } from "@/app/components/scene-player";
import { ListeningLab } from "@/app/components/listening-lab";
import { fullSceneSetForLesson, dictationForLevel } from "@/src/domain/scenes";
import { practiceForLesson } from "@/src/domain/practice-generator";
import { missionFor } from "@/src/domain/mission";
import { MVP_LESSONS } from "@/src/domain/curriculum";
import { bodyForProfessionalLesson } from "@/src/domain/professional-bodies";
import { materialsForProfessionalLesson } from "@/src/domain/professional-materials";
import { scenesForProfessionalLesson } from "@/src/domain/professional-scenes";
import { PROFESSIONAL_CURRICULUM } from "@/src/domain/professional-curriculum";

interface Lesson { id: string; title: string; mission: string; objectiveId: string; level: string; skill: string }

function findLesson(lessonId: string): Lesson | null {
  const gen = MVP_LESSONS.find((l) => l.id === lessonId);
  if (gen) return gen;
  const pro = PROFESSIONAL_CURRICULUM.find((l) => l.id === lessonId);
  if (pro) return pro;
  return null;
}

function QuickPractice({ exercises }: { exercises: Array<{ q: string; choices?: string[]; answer?: number; typed?: boolean; accept?: string[] }> }) {
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [typed, setTyped] = useState<Record<number, string>>({});
  const normalise = (s: string) => s.toLowerCase().replace(/[^a-z0-9' ]/g, " ").replace(/\s+/g, " ").trim();
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {exercises.map((ex, qi) => {
        if (ex.typed) {
          const value = typed[qi] ?? "";
          const correct = (ex.accept ?? []).some((a) => normalise(a) === normalise(value));
          return (
            <div key={qi} style={{ padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border-default)" }}>
              <p style={{ margin: "0 0 8px" }}><strong>{qi + 1}.</strong> {ex.q}</p>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <input aria-label={`Answer for question ${qi + 1}`} value={value} disabled={picked[qi] !== undefined} onChange={(e) => setTyped((p) => ({ ...p, [qi]: e.target.value.slice(0, 60) }))} onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) setPicked((p) => ({ ...p, [qi]: correct ? 1 : 0 })); }} style={{ maxWidth: 320, padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-primary)", fontSize: 14 }} placeholder="Type your answer…" />
                {picked[qi] === undefined && <button type="button" className="button secondary" disabled={!value.trim()} onClick={() => setPicked((p) => ({ ...p, [qi]: correct ? 1 : 0 }))}>Check</button>}
              </div>
              {picked[qi] !== undefined && <p style={{ margin: "6px 0 0", fontWeight: 600, color: picked[qi] === 1 ? "var(--success)" : "var(--danger)" }}>{picked[qi] === 1 ? "✓ Correct!" : `✗ The answer was "${ex.accept?.[0]}"`}</p>}
            </div>
          );
        }
        const choices = ex.choices ?? [];
        const chosen = picked[qi];
        return (
          <div key={qi} style={{ padding: "12px 14px", background: "var(--bg-secondary)", borderRadius: 10, border: "1px solid var(--border-default)" }}>
            <p style={{ margin: "0 0 8px" }}><strong>{qi + 1}.</strong> {ex.q}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {choices.map((c, ci) => (
                <button key={ci} type="button" className={chosen === undefined ? "button secondary" : ci === ex.answer ? "button" : chosen === ci ? "state-card error" : "button secondary"} style={{ padding: "8px 14px" }} onClick={() => setPicked((p) => ({ ...p, [qi]: ci }))}>
                  {chosen !== undefined && ci === ex.answer ? "✓ " : ""}{c}
                </button>
              ))}
            </div>
            {chosen !== undefined && chosen !== ex.answer && ex.choices && (
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--danger)" }}>Correct answer: {ex.choices[ex.answer ?? 0]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LearnLessonPage(props: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(props.params);
  const decodedId = decodeURIComponent(lessonId);

  const [tab, setTab] = useState<"mission" | "words" | "scene" | "listen" | "practice">("mission");
  const [sceneIdx, setSceneIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [production, setProduction] = useState("");
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const isProfessional = decodedId.startsWith("pro-");
  const lesson = useMemo(() => findLesson(decodedId), [decodedId]);

  const lessonBodyData = useMemo(() => isProfessional ? bodyForProfessionalLesson(decodedId) : lessonBody(decodedId), [decodedId, isProfessional]);
  const materials = useMemo(() => isProfessional ? materialsForProfessionalLesson(decodedId) : materialsFor(decodedId), [decodedId, isProfessional]);
  const sceneSet = useMemo(() => isProfessional ? scenesForProfessionalLesson(decodedId) : fullSceneSetForLesson(decodedId), [decodedId, isProfessional]);
  const practiceSet = useMemo(() => isProfessional && materials ? materials.exercises : practiceForLesson(decodedId, completedLessonIds.slice(-4)), [decodedId, isProfessional, materials, completedLessonIds]);
  const mission = useMemo(() => isProfessional ? null : missionFor(decodedId), [decodedId, isProfessional]);

  const scene = sceneSet[Math.min(sceneIdx, sceneSet.length - 1)] ?? sceneSet[0];

  useEffect(() => {
    fetch("/api/learner-state", { cache: "no-store" }).then(async (r) => { const p = await r.json(); if (r.ok) setCompletedLessonIds(p.state?.completedLessonIds ?? []); }).catch(() => {});
  }, []);

  const tabs: Array<[typeof tab, string, string]> = [
    ["mission", "🧭", "Mission"],
    ["words", "🔑", `Words (${materials?.vocab.length ?? 0})`],
    ["scene", `🎬`, `Scenes (${sceneSet.length})`],
    ["listen", "🎧", "Listening"],
    ["practice", "🧠", `Practice (${practiceSet.length})`],
  ];

  async function handleComplete() {
    if (!lesson) return;
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/lesson/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: decodedId, evidenceIds: [], performanceScore: production.length >= 20 ? 75 : 0 }),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error ?? "Failed to complete lesson.");
      setDone(true);
      setCompletedLessonIds((prev) => [...prev, decodedId]);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
    setBusy(false);
  }

  if (!lesson) return <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}><h1>Lesson not found</h1><p>The lesson &ldquo;{decodedId}&rdquo; doesn&rsquo;t exist.</p><a className="button" href="/learning-path">← Back to learning path</a></main>;

  const color = lesson.level === "Pre-A1" ? "#94a3b8" : lesson.level === "A1" ? "#38bdf8" : lesson.level === "A2" ? "#34d399" : lesson.level === "B1" ? "#fbbf24" : lesson.level === "B2" ? "#fb923c" : lesson.level === "C1" ? "#f87171" : "#a855f7";

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <a href="/learning-path" style={{ fontSize: 13, opacity: 0.7, display: "inline-block", marginBottom: 12 }}>← Back to learning path</a>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 8, background: `${color}22`, color, fontWeight: 700, fontSize: 13 }}>{lesson.level}</span>
        <span style={{ fontSize: 13, opacity: 0.6, textTransform: "capitalize" }}>{lesson.skill}</span>
        {isProfessional && <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent-text)", fontWeight: 600 }}>Professional</span>}
      </div>
      <h1 style={{ fontSize: 26, margin: "0 0 6px" }}>{lesson.title}</h1>
      <p style={{ fontSize: 16, lineHeight: 1.6, margin: "0 0 20px", opacity: 0.85 }}>{lesson.mission}</p>

      <div role="tablist" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {tabs.map(([id, icon, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "button" : "button secondary"} onClick={() => setTab(id)}>{icon} {label}</button>
        ))}
      </div>

      {done ? (
        <div className="tint-success" style={{ padding: 32, borderRadius: 14, textAlign: "center" }}>
          <span style={{ fontSize: 48 }}>🎉</span>
          <h2 style={{ margin: "8px 0" }}>Lesson complete!</h2>
          <p style={{ margin: "4px 0 16px", opacity: 0.7 }}>Great work on &ldquo;{lesson.title}&rdquo;.</p>
          <a className="button" href="/learning-path">Continue to next lesson →</a>
        </div>
      ) : (
        <>
          {tab === "mission" && (
            <div style={{ display: "grid", gap: 16 }}>
              {lessonBodyData ? (
                <section style={{ padding: 22, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <p className="eyebrow">Teach</p>
                  <h2 style={{ fontSize: 18, margin: "6px 0 10px" }}>How this works</h2>
                  <p style={{ lineHeight: 1.7, margin: "0 0 12px" }}>{lessonBodyData.explanation}</p>
                  <h3 style={{ fontSize: 15, margin: "12px 0 4px" }}>Examples</h3>
                  <ul style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.9 }}>{lessonBodyData.examples.map((ex) => <li key={ex}>{ex}</li>)}</ul>
                  <details><summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Common mistakes</summary><ul style={{ paddingLeft: 20, lineHeight: 1.8, marginTop: 8 }}>{lessonBodyData.commonMistakes.map((m) => <li key={m}>{m}</li>)}</ul></details>
                  <p className="subtle" style={{ marginTop: 10 }}>💡 {lessonBodyData.tip}</p>
                </section>
              ) : <p className="subtle">Teaching content loading…</p>}

              {mission && (
                <section className="tint-accent" style={{ padding: 22, borderRadius: 14, borderLeft: "4px solid var(--accent-primary)" }}>
                  <p className="eyebrow">Stage · {mission.stageName}</p>
                  <p style={{ margin: "4px 0 12px", lineHeight: 1.7 }}><em>{mission.stageClaim}</em></p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>{mission.topicTitles.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                  <p className="eyebrow" style={{ margin: "0 0 4px" }}>Characters</p>
                  <ul style={{ margin: "0 0 12px", paddingLeft: 20, lineHeight: 1.8 }}>{mission.cast.map((c) => <li key={c}>{c}</li>)}</ul>
                  {mission.roleplay && <div style={{ padding: 14, background: "var(--surface-card)", borderRadius: 12, border: "1px solid var(--border-subtle)" }}><p style={{ margin: "0 0 8px", fontWeight: 700 }}>🎭 Role-play: {mission.roleplay.scenarioId.replace("rp-", "")}</p><p style={{ margin: 0, lineHeight: 1.6, fontSize: 14 }}>{mission.roleplay.situation}<br /><strong>You:</strong> {mission.roleplay.yourRole} · <strong>Partner:</strong> {mission.roleplay.partnerRole}</p></div>}
                </section>
              )}

              {isProfessional && lessonBodyData && (
                <section style={{ padding: 22, background: "var(--accent-soft)", borderRadius: 14, borderLeft: "4px solid var(--accent-primary)" }}>
                  <p className="eyebrow">Professional focus</p>
                  <p style={{ lineHeight: 1.7 }}>This lesson covers professional {lesson.skill} skills at {lesson.level} level. Complete the practice exercises to demonstrate your understanding.</p>
                </section>
              )}
            </div>
          )}

          {tab === "words" && materials && (
            <div style={{ padding: 22, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}>
              <p className="subtle" style={{ margin: "0 0 12px" }}>{materials.vocab.length} words with British audio — tap 🔊 to listen.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {materials.vocab.map((w) => (
                  <span key={w.word} className="chip" style={{ fontSize: 14, padding: "6px 10px" }}>
                    {w.word} <span dir="rtl" style={{ opacity: 0.85 }}>· {w.ar}</span>
                    <button type="button" onClick={() => speakText(w.word, { lang: "en-GB", rate: 0.85 })} aria-label={`Listen to ${w.word}`} style={{ marginLeft: 6, cursor: "pointer" }}>🔊</button>
                  </span>
                ))}
              </div>
            </div>
          )}
          {tab === "words" && !materials && <p className="subtle">No vocabulary for this lesson yet.</p>}

          {tab === "scene" && sceneSet.length > 0 && (
            <div>
              {sceneSet.length > 1 && <div role="tablist" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>{sceneSet.map((s, i) => <button key={s.id} role="tab" aria-selected={i === sceneIdx} className={i === sceneIdx ? "button" : "button secondary"} onClick={() => setSceneIdx(i)}>{i + 1}</button>)}</div>}
              <ScenePlayer scene={scene} />
            </div>
          )}
          {tab === "scene" && sceneSet.length === 0 && <p className="subtle">No scenes for this lesson yet.</p>}

          {tab === "listen" && <ListeningLab items={dictationForLevel(lesson.level, 20, lesson.id)} />}

          {tab === "practice" && (
            <div>
              {practiceSet.length > 0 ? <QuickPractice exercises={practiceSet} /> : <p className="subtle">No practice exercises yet.</p>}
            </div>
          )}
        </>
      )}

      {!done && tab !== "practice" && (
        <section style={{ marginTop: 24, padding: 22, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 8px" }}>✍️ Production task</h3>
          <p style={{ margin: "0 0 10px", lineHeight: 1.6, fontSize: 14 }}>Complete this task to finish the lesson: <strong>{lesson.mission}</strong></p>
          <textarea value={production} onChange={(e) => setProduction(e.target.value.slice(0, 5000))} rows={5} style={{ width: "100%", fontSize: 14, lineHeight: 1.6, borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-primary)", padding: 12 }} placeholder="Write your response here…" />
          <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
            <button className="button" disabled={busy || production.length < 20} onClick={() => void handleComplete()}>{busy ? "Saving…" : "Complete lesson ✓"}</button>
            {production.length < 20 && <span className="subtle" style={{ fontSize: 12 }}>Write at least 20 characters</span>}
          </div>
          {error && <p role="alert" style={{ color: "var(--danger)", marginTop: 8 }}>{error}</p>}
        </section>
      )}

      {tab === "practice" && !done && (
        <section style={{ marginTop: 24, padding: 22, background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}>
          <h3 style={{ margin: "0 0 8px" }}>✍️ Complete the lesson</h3>
          <textarea value={production} onChange={(e) => setProduction(e.target.value.slice(0, 5000))} rows={4} style={{ width: "100%", fontSize: 14, lineHeight: 1.6, borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--surface-card)", color: "var(--text-primary)", padding: 12 }} placeholder="Write a summary of what you learned…" />
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="button" disabled={busy || production.length < 20} onClick={() => void handleComplete()}>{busy ? "Saving…" : "Complete lesson ✓"}</button>
          </div>
          {error && <p role="alert" style={{ color: "var(--danger)", marginTop: 8 }}>{error}</p>}
        </section>
      )}
    </main>
  );
}
