"use client";

import { useMemo, useRef, useState } from "react";
import { buildMock, cefrFromPercent, ieltsBand, scoreWritingMock } from "@/src/domain/exam-mock";
import { scoreSpeech } from "@/src/domain/speech-scoring";
import { speakText, RECOGNITION_LANG } from "@/src/domain/tts";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";

type Stage = "intro" | "reading" | "writing" | "speaking" | "result";

export default function MockExamPage() {
  const [seed] = useState(() => Math.floor(Date.now() / 86400000));
  const mock = useMemo(() => buildMock(seed), [seed]);
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writing, setWriting] = useState("");
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  function listenSpeaking() {
    const ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!ctor) return;
    const recognition = new ctor();
    recognitionRef.current = recognition;
    recognition.lang = RECOGNITION_LANG;
    recognition.interimResults = false;
    recognition.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => {
      setTranscript(Array.from(event.results ?? []).map((item) => item[0]?.transcript ?? "").join(" ").trim());
      setListening(false);
    };
    recognition.start();
    setListening(true);
  }

  const readingPercent = useMemo(() => {
    if (stage !== "result") return 0;
    const correct = mock.questions.filter((q) => (answers[q.id] ?? "").toLowerCase().includes(q.answer.toLowerCase().split(" ")[0])).length;
    return Math.round((correct / Math.max(1, mock.questions.length)) * 100);
  }, [stage, answers, mock]);

  const speakingPercent = useMemo(() => (stage === "result" && transcript ? scoreSpeech(mock.speakingPhrase, transcript).accuracy : 0), [stage, transcript, mock]);
  const writingPercent = useMemo(() => (stage === "result" ? scoreWritingMock(writing) : 0), [stage, writing]);
  const overall = Math.round(readingPercent * 0.35 + writingPercent * 0.35 + speakingPercent * 0.3);

  async function finish() {
    setStage("result");
    try {
      await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "EXAM_PATHWAY", missionId: "mock-exam", objectiveId: `exam-mock:${seed}`,
          capabilityIds: ["reading.detail", "writing.argument"], modality: "WRITING",
          outcome: overall >= 60 ? "CORRECT" : "PARTIAL", score: overall, confidence: 0.7,
          level: cefrFromPercent(overall), context: "UNFAMILIAR", errorTags: [],
        }),
      });
    } catch { /* best effort */ }
  }

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      <PageHero icon="📝" title="Timed mock exam" sub="Reading → Writing → Speaking. A transparent internal estimate of your level and IELTS-style band — not an official certification." />

      {stage === "intro" && (
        <section className="panel" style={{ padding: 26 }}>
          <h2>Three sections, about ten minutes</h2>
          <ol style={{ lineHeight: 2 }}>
            <li><strong>Reading</strong> — one passage, comprehension questions.</li>
            <li><strong>Writing</strong> — one argument task, scored on length + structure + linking.</li>
            <li><strong>Speaking</strong> — read one sentence aloud; scored word-by-word.</li>
          </ol>
          <button className="button" onClick={() => setStage("reading")}>Start mock →</button>
        </section>
      )}

      {stage === "reading" && (
        <section className="panel" style={{ padding: 24 }}>
          <p className="eyebrow">Section 1 · Reading — {mock.readingTitle}</p>
          <article style={{ lineHeight: 1.9, margin: "10px 0 16px" }}>{mock.readingPassage}</article>
          {mock.questions.map((q) => (
            <label key={q.id} style={{ display: "grid", gap: 6, marginBottom: 14 }}>
              <strong>{q.question}</strong>
              <input value={answers[q.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))} />
            </label>
          ))}
          <button className="button" onClick={() => setStage("writing")}>Continue to writing →</button>
        </section>
      )}

      {stage === "writing" && (
        <section className="panel" style={{ padding: 24 }}>
          <p className="eyebrow">Section 2 · Writing</p>
          <p style={{ lineHeight: 1.6 }}>{mock.writingPrompt}</p>
          <textarea aria-label="Your essay" rows={9} value={writing} onChange={(e) => setWriting(e.target.value)} />
          <div><button className="button" disabled={writing.trim().split(/\s+/).filter(Boolean).length < 30} style={{ marginTop: 10 }} onClick={() => setStage("speaking")}>Continue to speaking →</button></div>
        </section>
      )}

      {stage === "speaking" && (
        <section className="panel" style={{ padding: 24 }}>
          <p className="eyebrow">Section 3 · Speaking — read aloud</p>
          <h3 style={{ fontSize: 22, lineHeight: 1.5 }}>“{mock.speakingPhrase}”</h3>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="button secondary" onClick={() => speakText(mock.speakingPhrase, { lang: "en-GB", rate: 0.95 })}>🔊 Hear it</button>
            {!listening
              ? <button className="button" onClick={listenSpeaking}>🎙️ Record</button>
              : <button className="button" style={{ background: "#ef4444" }} onClick={() => { recognitionRef.current?.stop(); setListening(false); }}>⏹ Stop</button>}
          </div>
          {transcript && <p className="subtle" style={{ marginTop: 10 }}>Heard: “{transcript}”</p>}
          <div style={{ marginTop: 14 }}>
            <button className="button" disabled={!transcript} onClick={() => void finish()}>See my result →</button>
          </div>
        </section>
      )}

      {stage === "result" && (
        <>
          <Celebration trigger="done" />
          <section className="result-box" style={{ padding: 28, textAlign: "center" }}>
            <p className="eyebrow">Internal estimate</p>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#4626b8" }}>{cefrFromPercent(overall)}</div>
            <p>IELTS-style band ≈ <strong>{ieltsBand(overall)}</strong> · overall evidence score <strong>{overall}%</strong></p>
            <div className="stat-strip">
              <div className="stat-tile"><strong>{readingPercent}%</strong><span>Reading</span></div>
              <div className="stat-tile"><strong>{writingPercent}%</strong><span>Writing</span></div>
              <div className="stat-tile"><strong>{speakingPercent}%</strong><span>Speaking</span></div>
            </div>
            <p className="subtle" style={{ fontSize: 13, marginTop: 12 }}>
              Transparent method: reading 35% + writing 35% + speaking 30%. This is an internal estimate against CEFR descriptors — not an official IELTS/TOEFL score.
            </p>
            <a className="button" href="/pathways">Back to pathways</a>
          </section>
        </>
      )}
    </main>
  );
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
}
