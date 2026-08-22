"use client";

import { useEffect, useMemo, useState } from "react";
import { speakText, RECOGNITION_LANG } from "@/src/domain/tts";

type Question = { id: string; skill: string; prompt: string; options: string[]; audioText?: string };
type SpeechResultAlternative = { transcript?: string };
type SpeechRecognitionResultLike = { 0?: SpeechResultAlternative; isFinal?: boolean };
type SpeechRecognitionEventLike = { results?: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((event: SpeechRecognitionEventLike) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;
type Adaptive = { askedIds: string[]; nextQuestionId: string | null; questionsRemaining: number; stopped: boolean };

export default function DiagnosticPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [adaptive, setAdaptive] = useState<Adaptive>({ askedIds: [], nextQuestionId: null, questionsRemaining: 0, stopped: false });
  const [writingSample, setWritingSample] = useState("");
  const [speakingTranscript, setSpeakingTranscript] = useState("");
  const [listeningId, setListeningId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState<{ level: string; overallScore: number; strengths: string[]; focusAreas: string[]; production?: { writingScore: number; speakingScore: number } } | null>(null);
  const [busy, setBusy] = useState(false);
  const [adaptiveBusy, setAdaptiveBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/diagnostic", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? "Unable to load the diagnostic.");
        return payload;
      })
      .then((payload) => {
        setQuestions(payload.questions ?? []);
        setAdaptive(payload.adaptive ?? { askedIds: [], nextQuestionId: null, questionsRemaining: 0, stopped: false });
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load the diagnostic."));
  }, []);

  const activeQuestion = useMemo(() => {
    const id = adaptive.nextQuestionId ?? (adaptive.askedIds.length === 0 ? questions[0]?.id : null);
    return questions.find((question) => question.id === id) ?? null;
  }, [adaptive, questions]);

  function play(question: Question) {
    if (!question.audioText || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setListeningId(question.id);
    speakText(question.audioText, { lang: "en-GB", rate: 0.9, onEnd: () => setListeningId(null) });
  }

  function startSpeaking() {
    if (typeof window === "undefined") return;
    const ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    if (!ctor) {
      setError("Speech recognition is not supported in this browser. Type the response in the speaking box instead.");
      return;
    }
    const recognition = new ctor();
    recognition.lang = RECOGNITION_LANG;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results ?? []).map((item) => item[0]?.transcript ?? "").join(" ").trim();
      if (transcript) setSpeakingTranscript(transcript);
    };
    recognition.onerror = () => setError("We could not capture your spoken response. You can type the same response below.");
    recognition.onend = () => setRecording(false);
    setRecording(true);
    recognition.start();
  }

  async function choose(option: string) {
    if (!activeQuestion) return;
    const nextAnswers = { ...answers, [activeQuestion.id]: option };
    setAnswers(nextAnswers);
    setAdaptiveBusy(true);
    setError(null);
    try {
      const encoded = encodeURIComponent(JSON.stringify(Object.entries(nextAnswers).map(([id, answer]) => ({ id, answer }))));
      const response = await fetch(`/api/diagnostic?answers=${encoded}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to choose the next diagnostic item.");
      setAdaptive(payload.adaptive ?? adaptive);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to choose the next diagnostic item.");
    } finally {
      setAdaptiveBusy(false);
    }
  }

  async function submit() {
    if (!adaptive.stopped && activeQuestion) {
      setError("Finish the adaptive diagnostic questions before submitting your production evidence.");
      return;
    }
    if (writingSample.trim().split(/\s+/).filter(Boolean).length < 10) {
      setError("Write at least 10 words in the writing sample so we can assess production evidence.");
      return;
    }
    if (speakingTranscript.trim().split(/\s+/).filter(Boolean).length < 5) {
      setError("Give at least a short spoken response, or type the response in the speaking box.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/diagnostic", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers: Object.entries(answers).map(([id, answer]) => ({ id, answer })), production: { writingSample, speakingTranscript } }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to score the diagnostic.");
      setResult(payload.result);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to score the diagnostic.");
    } finally {
      setBusy(false);
    }
  }

  if (result) return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
      <p className="eyebrow">English DNA</p>
      <h1>Your starting profile: {result.level}</h1>
      <p style={{ fontSize: 22 }}>Diagnostic score: <strong>{result.overallScore}%</strong></p>
      <div className="content-grid">
        <section className="panel"><h2>Strengths</h2><p>{result.strengths.join(" · ") || "We need more evidence."}</p></section>
        <section className="panel"><h2>Focus areas</h2><p>{result.focusAreas.join(" · ") || "Keep building breadth."}</p></section>
      </div>
      <section className="panel" style={{ marginTop: 18 }}><h2>Production evidence</h2><p>Writing: {result.production?.writingScore ?? 0}% · Speaking transcript: {result.production?.speakingScore ?? 0}%</p></section>
      <a className="button" href="/welcome" style={{ marginTop: 18 }}>Claim your first win →</a>
    </main>
  );

  return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "56px 24px" }}>
      <p className="eyebrow">Adaptive Diagnostic</p>
      <h1>Let’s map your English with real evidence.</h1>
      <p className="subtle">The next question is selected from your answers to probe uncertainty and coverage instead of forcing everyone through the same sequence.</p>
      {error && <p role="alert" style={{ color: "#a53b3b" }}>{error}</p>}

      {activeQuestion && !adaptive.stopped && (
        <section className="panel" style={{ marginTop: 28 }}>
          <span className="eyebrow">Adaptive question · {adaptive.askedIds.length + 1}</span>
          <h2 style={{ marginTop: 6 }}>{activeQuestion.prompt}</h2>
          {activeQuestion.audioText && <button className="button button-secondary" type="button" onClick={() => play(activeQuestion)}>{listeningId === activeQuestion.id ? "Playing…" : "▶ Listen"}</button>}
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {activeQuestion.options.map((option) => <button key={option} disabled={adaptiveBusy} onClick={() => void choose(option)} style={{ textAlign: "left", padding: 14, borderRadius: 10, border: answers[activeQuestion.id] === option ? "2px solid #6840d6" : "1px solid #dfe3ec", background: answers[activeQuestion.id] === option ? "#f0ebff" : "white", cursor: adaptiveBusy ? "wait" : "pointer" }}>{option}</button>)}
          </div>
          <p className="subtle" style={{ marginTop: 12 }}>{adaptive.questionsRemaining} question slot(s) remain; the diagnostic may stop earlier when evidence is strong enough.</p>
        </section>
      )}

      {adaptive.stopped && (
        <>
          <section className="panel" style={{ marginTop: 28 }}>
            <span className="eyebrow">Adaptive stage complete</span>
            <h2>Now show what you can produce.</h2>
            <p className="subtle">The diagnostic stopped its recognition questions because the available evidence is sufficient for this stage.</p>
          </section>
          <section className="panel" style={{ marginTop: 18 }}>
            <span className="eyebrow">Production · writing</span>
            <h2>Write 10–80 words about your normal day.</h2>
            <textarea value={writingSample} onChange={(event) => setWritingSample(event.target.value)} rows={6} style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #dfe3ec" }} placeholder="I usually wake up…" />
          </section>
          <section className="panel" style={{ marginTop: 18 }}>
            <span className="eyebrow">Production · speaking</span>
            <h2>Introduce yourself in English.</h2>
            <p className="subtle">Use the microphone where supported, or type what you would say. This stores transcript evidence; it does not claim acoustic pronunciation scoring.</p>
            <button className="button button-secondary" type="button" onClick={startSpeaking} disabled={recording}>{recording ? "Listening…" : "🎙 Capture spoken response"}</button>
            <textarea value={speakingTranscript} onChange={(event) => setSpeakingTranscript(event.target.value)} rows={5} style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid #dfe3ec", marginTop: 12 }} placeholder="My name is…" />
          </section>
          <button className="button" disabled={busy} onClick={() => void submit()} style={{ marginTop: 20 }}>{busy ? "Analyzing your evidence…" : "Finish diagnostic →"}</button>
        </>
      )}
    </main>
  );
}
