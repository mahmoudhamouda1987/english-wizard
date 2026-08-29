"use client";
import { RECOGNITION_LANG } from "@/src/domain/tts";

import { useRef, useState } from "react";

type Feedback = {
  score?: number;
  strengths?: string[];
  corrections?: Array<{ original: string; improved: string; explanation: string }>;
  pronunciationRisks?: string[];
  nextPractice?: string;
  disclaimer?: string;
};

type SpeechResultAlternative = { transcript?: string };
type SpeechRecognitionResultLike = { 0?: SpeechResultAlternative; isFinal?: boolean };
type SpeechRecognitionEventLike = { results?: ArrayLike<SpeechRecognitionResultLike>; error?: string };
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export default function SpeakingPage() {
  const [prompt, setPrompt] = useState("Tell me about your plans for tomorrow.");
  const [transcript, setTranscript] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  function toggleRecording() {
    setError(null);
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const win = window as typeof window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Ctor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!Ctor) {
      setError("Live speech-to-text is not available in this browser. Type or paste your answer below instead.");
      return;
    }
    const recognition = new Ctor();
    recognition.lang = RECOGNITION_LANG;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      const results = event.results ?? [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const text = result?.[0]?.transcript ?? "";
        if (result?.isFinal) finalText += text + " ";
      }
      if (finalText) setTranscript((current) => (current ? current + " " : "") + finalText.trim());
    };
    recognition.onerror = (event) => setError(event?.error ? `Speech recognition error: ${event.error}` : "Speech recognition failed.");
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  }

  async function getFeedback() {
    if (transcript.trim().length < 5) {
      setError("Give a longer answer before asking the coach for feedback.");
      return;
    }
    setBusy(true);
    setError(null);
    setFeedback(null);
    try {
      const response = await fetch("/api/ai/speaking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, transcript }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to evaluate your speaking response.");
      setFeedback(payload.feedback);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to evaluate your speaking response.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "52px 24px" }}>
      <p className="eyebrow">Speaking Coach</p>
      <h1>Speak naturally. Get useful feedback.</h1>
      <p className="subtle">
        Answer the prompt aloud. English Wizard turns your speech into a transcript, then coaches your grammar, vocabulary and fluency signals
        without pretending to measure acoustic pronunciation when it has not received audio analysis.
      </p>

      <section className="panel" style={{ marginTop: 24 }}>
        <label style={{ display: "grid", gap: 8 }}>
          Prompt
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} style={{ width: "100%", padding: 12 }} />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button className="button" onClick={toggleRecording}>{recording ? "Stop speaking" : "Start speaking"}</button>
          <button className="button secondary" disabled={busy || transcript.trim().length < 5} onClick={getFeedback}>{busy ? "Analysing…" : "Get AI feedback"}</button>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
          {recording ? "Listening… speak at a comfortable pace." : "You can type or paste your answer if browser speech recognition is unavailable."}
        </p>
        <textarea aria-label="Speech transcript" value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8} placeholder="Your transcript appears here…" style={{ width: "100%", padding: 14, marginTop: 12 }} />
        {error && <p role="alert" style={{ color: "#a53b3b" }}>{error}</p>}
      </section>

      {feedback && (
        <section className="panel" style={{ marginTop: 20 }}>
          <div className="panel-title">
            <h2>Coach feedback</h2>
            <strong>{feedback.score ?? "—"}/100</strong>
          </div>
          {feedback.strengths?.length ? (
            <>
              <h3>Strengths</h3>
              <ul>{feedback.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          ) : null}
          {feedback.corrections?.length ? (
            <>
              <h3>Corrections</h3>
              {feedback.corrections.map((x, i) => (
                <div key={i} style={{ padding: 12, border: "1px solid #e3e7ef", borderRadius: 12, marginTop: 8 }}>
                  <p style={{ margin: 0 }}><strong>Original:</strong> {x.original}</p>
                  <p><strong>Better:</strong> {x.improved}</p>
                  <p style={{ marginBottom: 0 }}>{x.explanation}</p>
                </div>
              ))}
            </>
          ) : null}
          {feedback.pronunciationRisks?.length ? (
            <>
              <h3>Pronunciation risks</h3>
              <ul>{feedback.pronunciationRisks.map((x, i) => <li key={i}>{x}</li>)}</ul>
            </>
          ) : null}
          {feedback.nextPractice && <p><strong>Next practice:</strong> {feedback.nextPractice}</p>}
          {feedback.disclaimer && <p style={{ fontSize: 13, opacity: 0.7 }}>{feedback.disclaimer}</p>}
        </section>
      )}
    </main>
  );
}
