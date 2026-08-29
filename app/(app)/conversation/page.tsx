"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CEFRLevel } from "@/src/domain/curriculum";
import { wordOfDayForLevel } from "@/src/domain/word-of-day";
import { CONVERSATIONS, conversationForLevel } from "@/src/domain/conversation";
import { speakText } from "@/src/domain/tts";
import { PageHeader } from "@/app/components/page-header";
import { IconChat, IconCheck, IconClock, IconRoute, IconTarget } from "@/app/components/nav-icons";

type Exercise = ReturnType<typeof conversationForLevel>;

const LEVELS: CEFRLevel[] = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

const CURATED: Record<string, { arabic: string; pronunciation: string }> = {
  appointment: { arabic: "موعد", pronunciation: "/əˈpɔɪnt.mənt/" },
  explore: { arabic: "يستكشف", pronunciation: "/ɪkˈsplɔːr/" },
  transition: { arabic: "مرحلة انتقالية", pronunciation: "/trænˈzɪʃən/" },
  deliberate: { arabic: "مدروس / متعمد", pronunciation: "/dɪˈlɪbərət/" },
  proportionality: { arabic: "التناسب", pronunciation: "/prəˌpɔːrʃəˈnælɪti/" },
  intrusive: { arabic: "تدخلي / متطفل", pronunciation: "/ɪnˈtruːsɪv/" },
  flexibility: { arabic: "المرونة", pronunciation: "/ˌfleksəˈbɪləti/" },
  documentation: { arabic: "التوثيق", pronunciation: "/ˌdɒkjumenˈteɪʃən/" },
  uncertainty: { arabic: "عدم اليقين", pronunciation: "/ʌnˈsɜːrtənti/" },
  transparent: { arabic: "شفاف / واضح", pronunciation: "/trænˈspærənt/" },
  opportunities: { arabic: "فرص", pronunciation: "/ˌɑːpərˈtuːnətiz/" },
  advice: { arabic: "نصيحة", pronunciation: "/ədˈvaɪs/" },
};

function speak(text: string, _lang: string, rate = 0.92) {
  speakText(text, { lang: "en-GB", rate });
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, "").charAt(0).toUpperCase())
    .join("")
    .slice(0, 2) || "?";
}

function formatClock(totalSeconds: number): string {
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

type WordInfo = { meaning: string; arabic: string; pronunciation: string; partOfSpeech: string };

function TooltipWord({ word }: { word: string }) {
  const clean = word.replace(/[^A-Za-z'-]/g, "").toLowerCase();
  const [info, setInfo] = useState<WordInfo | null>(() => {
    const hit = CURATED[clean];
    return hit ? { meaning: "Learner vocabulary", arabic: hit.arabic, pronunciation: hit.pronunciation, partOfSpeech: "word" } : null;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!clean || CURATED[clean] || info) return;
    let active = true;
    fetch(`/api/word?word=${encodeURIComponent(clean)}`, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!active || !p) return;
        setInfo({ meaning: p.meaning, arabic: p.arabicMeaning, pronunciation: p.pronunciation, partOfSpeech: p.partOfSpeech });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [clean, info]);

  if (!/^[a-z][a-z'-]*$/i.test(clean)) return <span>{word}</span>;

  return (
    <span className="word-help" tabIndex={0} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {word}
      {open && (
        <span className="word-popover" role="tooltip">
          <strong>{clean}</strong>
          <span>{info?.partOfSpeech ?? "word"}</span>
          <span>{info?.meaning ?? "Looking up meaning…"}</span>
          <span>العربية: {info?.arabic ?? "جارٍ البحث عن الترجمة…"}</span>
          <span>Pronunciation: {info?.pronunciation ?? "—"}</span>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => speak(clean, "en-GB")}>Hear English</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => info && speak(info.arabic, "ar-SA")}>اسمع العربية</button>
        </span>
      )}
    </span>
  );
}

function WordExplainer({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) => (/\s+/.test(part) ? <span key={i}>{part}</span> : <TooltipWord key={i} word={part} />))}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <section className="panel" aria-hidden="true">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-text" style={{ width: "80%" }} />
        <div className="skeleton skeleton-text" style={{ width: "60%" }} />
        <div className="skeleton" style={{ height: 54, marginTop: 14 }} />
      </section>
      <section className="panel" aria-hidden="true">
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: "85%" }} />
        <div className="skeleton skeleton-text" style={{ width: "70%" }} />
      </section>
      <span className="sr-only">Loading the conversation…</span>
    </>
  );
}

export default function ConversationPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [todayId, setTodayId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [activeTurn, setActiveTurn] = useState<number>(-1);

  const fetchConversation = useCallback(async (target: CEFRLevel) => {
    try {
      const r = await fetch(`/api/conversation?level=${encodeURIComponent(target)}`);
      const p = await r.json();
      if (!r.ok) throw new Error(p.error ?? "Unable to load conversation");
      setExercise(p.exercise);
      setActiveTopicId(p.exercise.id as string);
      setTodayId(p.exercise.id as string);
      setAnswers({});
      setSubmitted(false);
      setSeconds(0);
      setPlaying(false);
      setFailed(false);
      setLoading(false);
    } catch {
      setFailed(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("english-wizard-level") as CEFRLevel | null;
    if (stored && LEVELS.includes(stored)) queueMicrotask(() => setLevel(stored));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`/api/conversation?level=${encodeURIComponent(level)}`);
        const p = await r.json();
        if (cancelled) return;
        if (!r.ok) throw new Error(p.error ?? "Unable to load conversation");
        setExercise(p.exercise);
        setActiveTopicId(p.exercise.id as string);
        setTodayId(p.exercise.id as string);
        setAnswers({});
        setSubmitted(false);
        setSeconds(0);
        setPlaying(false);
        setFailed(false);
        setLoading(false);
      } catch {
        if (cancelled) return;
        setFailed(true);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
    };
  }, [level]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setSeconds((v) => (v >= 60 ? 60 : v + 1)), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  const word = useMemo(() => wordOfDayForLevel(level), [level]);
  const levelTopics = useMemo(() => CONVERSATIONS.filter((item) => item.level === level), [level]);

  const score = exercise ? exercise.gaps.reduce((sum, g) => sum + (answers[g.id]?.trim().toLowerCase() === g.answer.toLowerCase() ? 1 : 0), 0) : 0;
  const blankedScript = exercise
    ? exercise.turns.map((turn, ti) => {
        const gaps = exercise.gaps.filter((g) => g.turnIndex === ti);
        let display = turn.text;
        for (const gap of gaps) display = display.replace(new RegExp(`\\b${gap.answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "_____");
        return { ...turn, display };
      })
    : [];

  function playConversation() {
    if (!exercise) return;
    if (playing) {
      window.speechSynthesis?.cancel();
      setPlaying(false);
      return;
    }
    window.speechSynthesis?.cancel();
    setSeconds(0);
    setPlaying(true);
    let index = 0;
    const speakNext = () => {
      if (!exercise || index >= exercise.turns.length) {
        setPlaying(false);
        setActiveSpeaker(null);
        setActiveTurn(-1);
        setSeconds(60);
        return;
      }
      const turnIndex = index;
      const turn = exercise.turns[index++];
      speakText(turn.text, {
        lang: "en-GB",
        rate: 0.9,
        pitch: turn.speaker === "A" ? 1.08 : 0.86,
        onStart: () => { setActiveSpeaker(turn.speaker); setActiveTurn(turnIndex); },
        onEnd: speakNext,
      });
    };
    speakNext();
  }

  function chooseLevel(lv: CEFRLevel) {
    if (lv === level) return;
    window.speechSynthesis?.cancel();
    setLevel(lv);
    setLoading(true);
    setFailed(false);
    setPlaying(false);
  }

  function retryLoad() {
    setFailed(false);
    setLoading(true);
    void fetchConversation(level);
  }
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setExercise(topic);
    setActiveTopicId(topic.id);
    setAnswers({});
    setSubmitted(false);
    setSeconds(0);
    setActiveSpeaker(null);
    setActiveTurn(-1);
  }

  const isToday = exercise ? todayId === exercise.id : false;
  const nextStep = !submitted
    ? "Play the conversation once for the gist, then complete the missing words as you listen again."
    : score === exercise?.gaps.length
      ? "Clear listening. Choose another topic from this level below, or come back tomorrow for a fresh conversation."
      : "Replay the conversation and focus on the lines with gaps, then check your answers again.";

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Practise — conversation"
        title="Conversation"
        purpose="Natural conversation practice: hear two characters talk, follow the transcript word by word, then show what you caught."
      />

      <div className="filters" role="group" aria-label="Choose your CEFR level">
        <span className="f-label">Level</span>
        {LEVELS.map((lv) => (
          <button key={lv} type="button" className="f-chip" data-active={lv === level} onClick={() => setLevel(lv)}>
            {lv}
          </button>
        ))}
      </div>

      {failed && (
        <div className="state-card error" role="alert">
          <strong>The conversation could not be loaded.</strong> Check your connection and try again.
          <div style={{ marginTop: 10 }}>
            <button className="button secondary" onClick={() => loadConversation(level)}>Try again</button>
          </div>
        </div>
      )}

      {loading && <LoadingSkeleton />}

      {!loading && !failed && exercise && (
        <>
          <section className="conversation-card" aria-label="Today's conversation">
            <div className="conversation-title">
              <div>
                <span className="pill">{exercise.level}</span>
                <h2>{exercise.title}</h2>
                <p>{exercise.context}</p>
              </div>
              <span className="duration">{formatClock(exercise.durationSeconds)}</span>
            </div>
            <div className="conv-meta" style={{ marginTop: 10 }}>
              <span className="pill"><IconTarget size={12} /> Goal: catch {exercise.gaps.length} missing words</span>
              <span className="pill"><IconClock size={12} /> About one minute</span>
              <span className="pill"><IconChat size={12} /> {exercise.turns.length} turns · two speakers</span>
              {isToday && <span className="pill">Today&rsquo;s conversation</span>}
            </div>
            <div className="player">
              <button className="button" onClick={playConversation} aria-pressed={playing}>
                {playing ? "Pause conversation" : seconds >= exercise.durationSeconds ? "Replay conversation" : "Play conversation"}
              </button>
              <div className="timeline" role="progressbar" aria-label="Playback progress" aria-valuemin={0} aria-valuemax={exercise.durationSeconds} aria-valuenow={seconds}>
                <i style={{ width: `${Math.min(100, (seconds / exercise.durationSeconds) * 100)}%` }} />
              </div>
              <span>{formatClock(Math.min(seconds, exercise.durationSeconds))}</span>
            </div>
            <div className="stage" aria-label="Conversation scene">
              {exercise.speakers.map((speaker, i) => (
                <div key={speaker.id} className={`actor ${activeSpeaker === speaker.id && playing ? "speaking" : ""}`}>
                  <span className={`ava ${i === 1 ? "amy" : ""}`} aria-hidden="true">{initials(speaker.name)}</span>
                  <strong>{speaker.name}</strong>
                  <small>{speaker.role}</small>
                  <span className="wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
                </div>
              ))}
            </div>
            <div className="caption-strip" aria-live="polite">
              {exercise.turns.map((turn, index) => (
                <p key={index} className={`caption-line ${activeTurn === index ? "active" : ""}`}><b>{turn.name}:</b> {turn.text}</p>
              ))}
            </div>
            <div className="speaker-row">
              {exercise.speakers.map((speaker) => <span key={speaker.id}><strong>{speaker.name}</strong> · {speaker.role}</span>)}
            </div>
          </section>

          <section className="conversation-grid">
            <article className="panel">
              <div className="panel-title">
                <h3>Conversation transcript</h3>
                <span>Hover or focus any word for help</span>
              </div>
              <div className="transcript">
                {exercise.turns.map((turn, index) => <p key={index}><strong>{turn.name}:</strong> <WordExplainer text={turn.text} /></p>)}
              </div>
            </article>

            <aside className="panel word-card">
              <p className="eyebrow">Daily vocabulary</p>
              <h3>{word.word}</h3>
              <span className="word-type">{word.partOfSpeech} · {word.level}</span>
              <div className="word-pronounce">
                <button className="button secondary" type="button" onClick={() => speak(word.word, "en-GB")}>Hear English</button>{" "}
                <button className="button secondary" type="button" onClick={() => speak(word.arabicMeaning, "ar-SA")}>اسمع العربية</button>
              </div>
              <p><strong>Meaning:</strong> {word.meaning}</p>
              <p><strong>العربية:</strong> {word.arabicMeaning}</p>
              <p><strong>Pronunciation:</strong> {word.pronunciation}</p>
              <p className="example">“{word.example}”</p>
            </aside>
          </section>

          <section className="panel gap-panel">
            <div className="panel-title">
              <div>
                <h3>Listen &amp; complete</h3>
                <p>Here is the same script with {exercise.gaps.length} words removed.</p>
              </div>
              <span>{exercise.gaps.length} missing words</span>
            </div>
            <div className="transcript">
              {blankedScript.map((turn, index) => <p key={index}><strong>{turn.name}:</strong> {turn.display}</p>)}
            </div>
            <div className="gap-script">
              {exercise.gaps.map((gap, index) => (
                <div className="gap-line" key={gap.id}>
                  <span>{index + 1}.</span>
                  <span>{exercise.turns[gap.turnIndex]?.name}:</span>
                  <input aria-label={`Missing word ${index + 1}`} value={answers[gap.id] ?? ""} onChange={(e) => setAnswers((current) => ({ ...current, [gap.id]: e.target.value }))} placeholder="type what you heard" />
                </div>
              ))}
            </div>
            <button className="button secondary" onClick={() => setSubmitted(true)}>Check answers</button>
            {submitted && (
              <div className="result-box" role="status" aria-label="Your listening feedback">
                <p style={{ margin: 0 }}>
                  <strong>{score}/{exercise.gaps.length}</strong> correct.{" "}
                  {score === exercise.gaps.length
                    ? "Excellent listening — you caught every word."
                    : "Replay the conversation and listen again before checking once more."}
                </p>
              </div>
            )}
            <div className="conv-next" style={{ marginTop: 14 }}>
              <IconRoute size={16} />
              <span><strong>Next step:</strong> {nextStep}</span>
            </div>
          </section>

          <section className="panel">
            <div className="panel-title">
              <h3>Conversations at {level}</h3>
              <span>A new topic is highlighted each day — revisit the others any time</span>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {levelTopics.map((topic) => {
                const active = topic.id === activeTopicId;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    className="mission-row"
                    data-active={active}
                    aria-pressed={active}
                    onClick={() => chooseTopic(topic)}
                  >
                    <span className="mi-num" aria-hidden="true"><IconChat size={15} /></span>
                    <span className="mi-body">
                      <strong>{topic.title}{topic.id === exercise.id && isToday ? " — today" : ""}</strong>
                      <small>{topic.context} · {topic.turns.length} turns · {formatClock(topic.durationSeconds)}</small>
                    </span>
                    <span className="mi-meta">{active ? "Now practising" : "Start this topic"}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="panel vocabulary-tip">
            <strong>Vocabulary help:</strong> stand over any English word — or reach it with the keyboard — to see its meaning, Arabic meaning, pronunciation, and buttons to hear both languages.
          </section>
        </>
      )}

      {!loading && !failed && !exercise && (
        <div className="state-card info">
          <strong>What this area is:</strong> short, natural conversations with two British-English speakers, one for each topic at your level.
          <p className="empty" style={{ marginTop: 8 }}>
            <IconCheck size={14} /> What to do now: press “Try again” above, or pick another level — a conversation loads for every level.
          </p>
        </div>
      )}
    </main>
  );
}
