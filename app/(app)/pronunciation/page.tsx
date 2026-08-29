"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CEFRLevel } from "@/src/domain/learner";
import { phrasesForLevel } from "@/src/domain/speaking-lab";
import { scoreSpeech, type SpeechScore } from "@/src/domain/speech-scoring";
import { speakText, RECOGNITION_LANG } from "@/src/domain/tts";
import { PageHeader } from "@/app/components/page-header";
import { Celebration } from "@/app/components/celebration";
import { IconCheck, IconEar, IconMic, IconRoute, IconTarget } from "@/app/components/nav-icons";

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

function bandLabel(accuracy: number): string {
  if (accuracy >= 90) return "Native-like clarity — exactly the target.";
  if (accuracy >= 80) return "Very clear — polish the flagged words.";
  if (accuracy >= 50) return "Understandable — work on the missing words.";
  return "Let us try again — hear the model first, then repeat.";
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

  const position = (index % phrases.length) + 1;
  const cycleStage = score ? "feedback" : listening ? "record" : "prompt";

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Practise — speaking"
        title="Speaking Coach"
        purpose={`Structured speaking development: hear the British model, record your attempt, and receive honest word-by-word feedback at ${level}.`}
      />

      <div className="filters" role="group" aria-label="Choose your CEFR level">
        <span className="f-label">Level</span>
        {LEVELS.map((x) => (
          <button key={x} type="button" className="f-chip" data-active={x === level} onClick={() => { setLevel(x); setIndex(0); reset(); }}>{x}</button>
        ))}
      </div>

      <div className="practice-steps" aria-label="The practise cycle">
        <span className="step" data-done={cycleStage === "feedback"} data-on={cycleStage === "prompt"}>Prompt</span>
        <span className="step-sep" aria-hidden="true">→</span>
        <span className="step" data-done={Boolean(transcript)} data-on={cycleStage === "record"}>Record</span>
        <span className="step-sep" aria-hidden="true">→</span>
        <span className="step" data-done={Boolean(score)} data-on={false}>Analyse</span>
        <span className="step-sep" aria-hidden="true">→</span>
        <span className="step" data-done={false} data-on={cycleStage === "feedback"}>Feedback</span>
        <span className="step-sep" aria-hidden="true">→</span>
        <span className="step" data-done={false} data-on={Boolean(score)}>Repeat</span>
      </div>

      <section className="panel" aria-label="Current speaking target">
        <div className="panel-title">
          <span className="lc-badges" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span className="lc-badge skill">{phrase.focus}</span>
            <span className="lc-badge level">{level}</span>
          </span>
          <span>Phrase {position} of {phrases.length}</span>
        </div>
        <p className="eyebrow">Current speaking target</p>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 2.4vw, 26px)", lineHeight: 1.5, margin: "8px 0 16px", fontWeight: 600 }}>
          “{phrase.text}”
        </h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="button secondary" onClick={playTarget}><IconEar size={15} /> Hear British model</button>
          {!listening ? (
            <button className="button" onClick={listen}><IconMic size={15} /> Record my attempt</button>
          ) : (
            <button className="button recording" onClick={stop} aria-label="Stop recording"><IconMic size={15} /> Stop</button>
          )}
          <button className="button secondary" onClick={nextPhrase}><IconRoute size={15} /> Next phrase</button>
        </div>
        {listening && (
          <p className="empty" style={{ marginTop: 12 }} role="status">
            Listening… speak the full sentence clearly, then stop recording.
          </p>
        )}
        {unsupported && (
          <div className="state-card error" style={{ marginTop: 12 }} role="alert">
            Your browser does not support speech recognition. Use Chrome or Edge for scored practice — or practise with “Hear British model” and self-assess against the transcript below.
          </div>
        )}

        {score && (
          <section className="result-box" style={{ marginTop: 18 }} aria-label="Pronunciation feedback">
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 30 }}>{score.accuracy}%</strong>
              <span>{bandLabel(score.accuracy)}</span>
            </div>
            <div className="track" style={{ marginTop: 10 }} role="progressbar" aria-label="Word accuracy" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score.accuracy}>
              <span style={{ width: `${score.accuracy}%` }} />
            </div>
            <p style={{ marginTop: 10, marginBottom: 0 }}>
              <strong>Words we heard in order:</strong> {score.matched.length} of {score.matched.length + score.missing.length}
            </p>
            {score.missing.length > 0 && (
              <p style={{ marginTop: 8, marginBottom: 0 }}>
                <strong>Words we did not hear:</strong>{" "}
                {score.missing.map((w, i) => <span key={`${w}-${i}`} className="streak-pill" style={{ marginRight: 6, padding: "4px 10px", fontSize: 12 }}>{w}</span>)}
              </p>
            )}
            {score.extra.length > 0 && (
              <p className="empty" style={{ marginTop: 6, marginBottom: 0 }}>Extra words spoken: {score.extra.slice(0, 8).join(", ")}</p>
            )}
            <p className="empty" style={{ marginTop: 10, marginBottom: 0 }}>
              You said: “{transcript}”
              {saved && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 6, color: "var(--success)", fontWeight: 700 }}>
                  <IconCheck size={13} /> Saved to your learner model
                </span>
              )}
            </p>
          </section>
        )}
      </section>

      <section className="panel" aria-label="How to use the coach">
        <div className="panel-title"><h3>The cycle, and what happens next</h3></div>
        <p className="empty" style={{ margin: 0, lineHeight: 1.7 }}>
          <IconTarget size={14} /> One phrase at a time: hear the British model, record your attempt, and the coach aligns what you said against the target word by word.
          Read the feedback, repeat the phrase, and move to the next one — the counter above tracks your progress through this level&rsquo;s phrase set.
          Every attempt is stored as speaking evidence in your learner model.
        </p>
      </section>

      <section className="panel" aria-label="How scoring works">
        <div className="panel-title"><h3>How scoring works</h3></div>
        <p className="empty" style={{ lineHeight: 1.7, margin: 0 }}>
          Your speech is recognised with British-English models, then aligned word-by-word against the target.
          Every target word heard in order raises your score; extra words reduce it slightly. Same rules for everyone — no black box.
          Scoring uses browser speech recognition and does not claim phoneme-level pronunciation accuracy.
        </p>
      </section>

      <Celebration trigger={score && score.accuracy >= 80 ? `s${phrase.id}` : ""} />
    </main>
  );
}
