"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";
import { phrasesForLevel } from "@/src/domain/speaking-lab";
import { scoreSpeech, type SpeechScore } from "@/src/domain/speech-scoring";
import { speakText, RECOGNITION_LANG } from "@/src/domain/tts";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript?: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export default function SpeakingCoachPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const phrases = useMemo(() => phrasesForLevel(level), [level]);
  const [index, setIndex] = useState(0);
  const phrase = phrases[index % phrases.length];

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [score, setScore] = useState<SpeechScore | null>(null);
  const [saved, setSaved] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((p) => { if (p.profile?.targetLevel) setLevel(p.profile.targetLevel); }).catch(() => undefined);
  }, []);

  function reset() { setTranscript(null); setScore(null); setSaved(false); }

  function playTarget() {
    speakText(phrase.text, { lang: "en-GB", rate: 0.9 });
  }

  function listen() {
    const ctor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!ctor) { setUnsupported(true); return; }
    try {
      const recognition = new ctor();
      recognitionRef.current = recognition;
      recognition.lang = RECOGNITION_LANG;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const text = Array.from(event.results ?? []).map((item) => item[0]?.transcript ?? "").join(" ").trim();
        if (!text) return;
        setTranscript(text);
        const result = scoreSpeech(phrase.text, text);
        setScore(result);
        void fetch("/api/evidence", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sessionType: "QUICK_QUEST",
            missionId: `speaking-coach:${level.toLowerCase()}`,
            objectiveId: `speaking-coach:${phrase.id}`,
            capabilityIds: ["pronunciation.intelligibility"],
            modality: "SPEAKING",
            outcome: result.accuracy >= 80 ? "CORRECT" : result.accuracy >= 50 ? "PARTIAL" : "INCORRECT",
            score: result.accuracy,
            confidence: 0.85,
            level,
            context: "FAMILIAR",
            errorTags: result.missing.length ? [`missed:${result.missing.slice(0, 3).join(",")}`] : [],
          }),
        }).then((r) => { if (r.ok) setSaved(true); }).catch(() => undefined);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      setListening(true);
      recognition.start();
    } catch {
      setUnsupported(true);
      setListening(false);
    }
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function nextPhrase() {
    setIndex((v) => (v + 1) % phrases.length);
    reset();
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🗣️" title="Speaking Coach" sub={`Hear it, say it, get scored word-by-word. British English target voice at ${level}.`} />
      <Celebration trigger={score && score.accuracy >= 80 ? `s${phrase.id}` : ""} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {LEVELS.map((x) => <button key={x} className={x === level ? "button" : "button secondary"} onClick={() => { setLevel(x); setIndex(0); reset(); }}>{x}</button>)}
      </div>

      <section className="panel" style={{ marginTop: 18, padding: 26 }}>
        <p className="eyebrow">{phrase.focus} · phrase {(index % phrases.length) + 1}/{phrases.length}</p>
        <h2 style={{ fontSize: 24, lineHeight: 1.5, margin: "8px 0 14px" }}>“{phrase.text}”</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="button secondary" onClick={playTarget}>🔊 Hear British model</button>
          {!listening ? (
            <button className="button" onClick={listen}>🎙️ Record my attempt</button>
          ) : (
            <button className="button" style={{ background: "#ef4444" }} onClick={stop}>⏹ Stop</button>
          )}
          <button className="button secondary" onClick={nextPhrase}>Next phrase →</button>
        </div>
        {listening && <p className="subtle" style={{ marginTop: 12 }}>Listening… speak the full sentence clearly.</p>}
        {unsupported && (
          <div className="state-card error" style={{ marginTop: 12 }}>
            Your browser does not support speech recognition. Use Chrome or Edge for scored practice — or practise with “Hear British model” and self-assess.
          </div>
        )}

        {score && (
          <section className="result-box" style={{ marginTop: 18 }} aria-label="Pronunciation score">
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <strong style={{ fontSize: 30 }}>{score.accuracy}%</strong>
              <span>{score.accuracy >= 90 ? "Native-like clarity 🎯" : score.accuracy >= 80 ? "Very clear — polish the flagged words." : score.accuracy >= 50 ? "Understandable — work on the missing words." : "Let's try again — hear the model first."}</span>
            </div>
            {score.missing.length > 0 && (
              <p style={{ marginTop: 8 }}><strong>Words we didn&rsquo;t hear:</strong> {score.missing.map((w, i) => <span key={`${w}-${i}`} className="streak-pill" style={{ marginRight: 6 }}>{w}</span>)}</p>
            )}
            {score.extra.length > 0 && (
              <p className="subtle" style={{ marginTop: 4 }}>Extra words spoken: {score.extra.slice(0, 8).join(", ")}</p>
            )}
            <p className="subtle" style={{ marginTop: 8 }}>You said: “{transcript}”{saved ? " · saved to your learner model ✓" : ""}</p>
          </section>
        )}
      </section>

      <section className="panel" style={{ marginTop: 16, padding: 20 }}>
        <div className="panel-title"><h3>How scoring works</h3></div>
        <p className="subtle" style={{ lineHeight: 1.7, margin: 0 }}>
          Your speech is recognised with British-English models, then aligned word-by-word against the target.
          Every target word heard in order raises your score; extra words reduce it slightly. Same rules for everyone — no black box.
          Scoring uses browser speech recognition and does not claim phoneme-level pronunciation accuracy.
        </p>
      </section>
    </main>
  );
}
