"use client";

import { useEffect, useMemo, useState } from "react";
import type { CEFRLevel } from "@/src/domain/curriculum";
import { wordOfDayForLevel } from "@/src/domain/word-of-day";
import { conversationForLevel } from "@/src/domain/conversation";

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

function speak(text: string, lang: string, rate = 0.92) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
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
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => speak(clean, "en-US")}>🔊 English</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => info && speak(info.arabic, "ar-SA")}>🔊 العربية</button>
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

export default function ConversationPage() {
  const [level, setLevel] = useState<CEFRLevel>("A1");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [activeTurn, setActiveTurn] = useState<number>(-1);

  useEffect(() => {
    const stored = localStorage.getItem("english-wizard-level") as CEFRLevel | null;
    if (stored && LEVELS.includes(stored)) queueMicrotask(() => setLevel(stored));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/conversation?level=${encodeURIComponent(level)}`)
      .then(async (r) => {
        const p = await r.json();
        if (!r.ok) throw new Error(p.error ?? "Unable to load conversation");
        return p;
      })
      .then((p) => {
        if (cancelled) return;
        setExercise(p.exercise);
        setAnswers({});
        setSubmitted(false);
        setSeconds(0);
        setPlaying(false);
      })
      .catch(() => undefined);
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
      const utterance = new SpeechSynthesisUtterance(turn.text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = turn.speaker === "A" ? 1.08 : 0.86;
      utterance.onstart = () => { setActiveSpeaker(turn.speaker); setActiveTurn(turnIndex); };
      utterance.onend = speakNext;
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }

  if (!exercise) return <main id="main-content" className="conversation-shell"><p>Loading today’s conversation…</p></main>;

  return (
    <main id="main-content" className="conversation-shell">
      <header className="conversation-header">
        <div>
          <p className="eyebrow">Listening Lab</p>
          <h1>One-minute character conversation</h1>
          <p className="subtle">Listen to two characters, complete five missing words, then explore vocabulary in English and Arabic.</p>
        </div>
        <label className="level-picker">
          Level
          <select value={level} onChange={(e) => setLevel(e.target.value as CEFRLevel)}>
            {LEVELS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </label>
      </header>

      <section className="conversation-card">
        <div className="conversation-title">
          <div>
            <span className="pill">{exercise.level}</span>
            <h2>{exercise.title}</h2>
            <p>{exercise.context}</p>
          </div>
          <span className="duration">01:00</span>
        </div>
        <div className="player">
          <button className="button" onClick={playConversation}>{playing ? "Pause conversation" : seconds >= 60 ? "Replay conversation" : "Play conversation"}</button>
          <div className="timeline"><i style={{ width: `${(seconds / 60) * 100}%` }} /></div>
          <span>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</span>
        </div>
        <div className="stage" aria-label="Conversation scene">
          {exercise.speakers.map((speaker, i) => (
            <div key={speaker.id} className={`actor ${activeSpeaker === speaker.id && playing ? "speaking" : ""}`}>
              <span className={`ava ${i === 1 ? "amy" : ""}`} aria-hidden="true">{i === 1 ? "👩‍🏫" : "🧑‍💼"}</span>
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
            <span>Hover/focus any word for help</span>
          </div>
          <div className="transcript">
            {exercise.turns.map((turn, index) => <p key={index}><strong>{turn.name}:</strong> <WordExplainer text={turn.text} /></p>)}
          </div>
        </article>

        <aside className="panel word-card">
          <h2>Word of the Day</h2>
          <p className="eyebrow">Daily vocabulary</p>
          <h3>{word.word}</h3>
          <span className="word-type">{word.partOfSpeech} · {word.level}</span>
          <div className="word-pronounce">
            <button className="button secondary" type="button" onClick={() => speak(word.word, "en-US")}>🔊 English</button>{" "}
            <button className="button secondary" type="button" onClick={() => speak(word.arabicMeaning, "ar-SA")}>🔊 العربية</button>
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
            <p>Here is the same script with five words removed.</p>
          </div>
          <span>5 missing words</span>
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
          <div className="result-box">
            You got <strong>{score}/5</strong> correct. {score === 5 ? "Excellent listening!" : "Replay the conversation and listen again before checking."}
          </div>
        )}
      </section>

      <section className="panel vocabulary-tip">
        <strong>Vocabulary help:</strong> stand over any English word—or focus it with the keyboard—to see its meaning, Arabic meaning, pronunciation, and buttons to hear both languages.
      </section>
    </main>
  );
}
