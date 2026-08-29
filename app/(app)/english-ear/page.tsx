"use client";

import { useEffect, useMemo, useState } from "react";
import { speakText, speechFriendly } from "@/src/domain/tts";
import { Celebration } from "@/app/components/celebration";
import { PageHeader } from "@/app/components/page-header";
import { WordExplainer } from "@/app/components/WordPopover";
import { levelContent } from "@/src/domain/content-library";
import type { CEFRLevel } from "@/src/domain/learner";
import { IconEar, IconCheck } from "@/app/components/nav-icons";
import { track } from "@/app/lib/track";

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function EnglishEarPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const item = useMemo(() => levelContent(level).ear, [level]);
  const [heard, setHeard] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    track("english_ear_entered");
    let cancelled = false;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (cancelled) return;
        if (p.profile?.targetLevel) setLevel(p.profile.targetLevel);
        setBooting(false);
      })
      .catch(() => { if (!cancelled) setBooting(false); });
    return () => { cancelled = true; };
  }, []);

  function speak(text: string) {
    setPlaying(true);
    speakText(speechFriendly(text), { lang: "en-GB", rate: 0.9, onEnd: () => setPlaying(false) });
  }

  function chooseLevel(lv: CEFRLevel) {
    if (lv === level) return;
    window.speechSynthesis?.cancel();
    setLevel(lv);
    setAnswer("");
    setChecked(false);
    setSaved(false);
    setHeard(0);
  }

  const correct = checked && answer.trim().replace(/\s+/g, " ").toLowerCase() === item.writtenForm.trim().replace(/\s+/g, " ").toLowerCase();

  async function check() {
    const normal = answer.trim().replace(/\s+/g, " ").toLowerCase();
    const expected = item.writtenForm.trim().replace(/\s+/g, " ").toLowerCase();
    const isCorrect = normal === expected;
    setChecked(true);
    setBusy(true);
    setSaved(false);
    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "QUICK_QUEST",
          missionId: `english-ear:${level.toLowerCase()}`,
          objectiveId: `english-ear:${item.patternType.toLowerCase()}`,
          capabilityIds: [`ear:${item.patternType.toLowerCase()}`],
          modality: "LISTENING",
          outcome: isCorrect ? "CORRECT" : "PARTIAL",
          score: isCorrect ? 100 : 0,
          confidence: isCorrect ? 0.8 : 0.5,
          level,
          context: "FAMILIAR",
          errorTags: isCorrect ? [] : ["connected-speech-decoding"],
        }),
      });
      if (!response.ok) throw new Error("save-failed");
      setSaved(true);
    } catch {
      setSaved(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Listening studio"
        title="English Ear"
        purpose="Train your ear for real speech: hear the connected form, compare it with the written form, then decode it yourself."
      />

      <div className="filters" role="group" aria-label="Choose your CEFR level">
        <span className="f-label">Level</span>
        {LEVELS.map((lv) => (
          <button key={lv} type="button" className="f-chip" data-active={lv === level} onClick={() => chooseLevel(lv)}>
            {lv}
          </button>
        ))}
      </div>

      {booting ? (
        <div aria-busy="true" aria-label="Loading your listening session">
          <div className="skeleton skeleton-title" />
          <div className="skeleton" style={{ height: 180, borderRadius: 18 }} />
        </div>
      ) : (
        <>
          <section className="panel" aria-label="Listen and compare">
            <div className="panel-title">
              <h3>Step 1 — Listen and compare</h3>
              <span className="chip">{item.patternType}</span>
            </div>
            <p className="subtle" style={{ marginTop: 0 }}>
              <span aria-hidden="true" style={{ marginRight: 8, verticalAlign: -3 }}><IconEar size={16} /></span>
              Press <strong>Hear spoken form</strong> and notice how the sounds run together. Then hear the full written form and compare.
            </p>
            <h2 style={{ margin: "14px 0 4px", fontSize: 26 }}><WordExplainer text={item.spokenForm} /></h2>
            <p style={{ margin: "0 0 4px" }}>Written form: <strong><WordExplainer text={item.writtenForm} /></strong></p>
            <p className="subtle"><WordExplainer text={item.explanation} /></p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <button type="button" className={`button ${playing ? "speaking" : ""}`} onClick={() => { speak(item.spokenForm); setHeard((h) => h + 1); }}>
                <span className="wavebars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></span>
                Hear spoken form
              </button>
              <button type="button" className="button secondary" onClick={() => speak(item.writtenForm)}>Hear full form</button>
            </div>
            <p className="empty" style={{ marginTop: 10, fontSize: 13 }}>
              Listening attempts: {heard} of {item.replayCountTarget} recommended.
              {heard >= item.replayCountTarget ? " You have listened enough to decode confidently." : " Repetition is what trains the ear — listen again."}
            </p>
          </section>

          <section className="panel" aria-label="Decode what you heard">
            <div className="panel-title"><h3>Step 2 — Decode it</h3></div>
            <p className="subtle" style={{ marginTop: 0 }}><WordExplainer text={item.discriminationQuestion} /></p>
            <input
              value={answer}
              onChange={(e) => { setAnswer(e.target.value); setChecked(false); }}
              placeholder="Type the full form you heard…"
              aria-label="Your answer — the full written form"
              style={{ width: "100%", maxWidth: 420 }}
            />
            <div style={{ marginTop: 10 }}>
              <button type="button" className="button" disabled={!answer.trim() || busy} onClick={() => void check()}>
                {busy ? "Saving…" : "Check"}
              </button>
            </div>
            {checked ? (
              <p className={correct ? "state-card info" : "state-card warning"} style={{ marginTop: 12, marginBottom: 0, padding: "12px 16px" }} role="status">
                {correct
                  ? <>Correct decoding — <strong>{item.writtenForm}</strong>. Your listening evidence has been recorded.</>
                  : "Not quite. Listen again, compare the connected form with the written form, and retry."}
              </p>
            ) : null}
          </section>

          <Celebration trigger={saved ? "yes" : ""} />
          {saved ? (
            <p className="subtle" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <IconCheck size={14} /> Your listening evidence is now part of your learner model.
            </p>
          ) : null}
        </>
      )}
    </main>
  );
}
