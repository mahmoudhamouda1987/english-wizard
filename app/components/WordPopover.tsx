"use client";

import { useEffect, useState } from "react";

type WordInfo = { meaning: string; arabicMeaning: string; pronunciation: string; partOfSpeech: string };

export function speakWord(text: string, lang: "en-US" | "ar-SA") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

export function WordPopover({ word }: { word: string }) {
  const clean = word.replace(/[^A-Za-z'-]/g, "").toLowerCase();
  const [info, setInfo] = useState<WordInfo | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!clean) return;
    let active = true;
    fetch(`/api/word?word=${encodeURIComponent(clean)}`, { cache: "force-cache" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: WordInfo | null) => {
        if (active && payload) setInfo(payload);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [clean]);

  if (!/^[a-z][a-z'-]*$/i.test(clean)) return <span>{word}</span>;

  return (
    <span
      tabIndex={0}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      style={{ position: "relative", cursor: "help", textDecoration: "underline dotted", textDecorationThickness: 1 }}
    >
      {word}
      {open && (
        <span role="tooltip" style={{ position: "absolute", zIndex: 20, left: 0, top: "calc(100% + 8px)", width: 250, padding: 14, borderRadius: 12, border: "1px solid #dfe3ec", background: "#ffffff", boxShadow: "0 10px 30px rgba(20,20,40,.14)", display: "grid", gap: 7, color: "#25253a" }}>
          <strong>{clean}</strong>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{info?.partOfSpeech ?? "word"}</span>
          <span>{info?.meaning ?? "Looking up meaning…"}</span>
          <span>العربية: {info?.arabicMeaning ?? "جارٍ البحث عن الترجمة…"}</span>
          <span>Pronunciation: {info?.pronunciation ?? "—"}</span>
          <span style={{ display: "flex", gap: 6 }}>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => speakWord(clean, "en-US")}>🔊 English</button>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => info && speakWord(info.arabicMeaning, "ar-SA")}>🔊 العربية</button>
          </span>
        </span>
      )}
    </span>
  );
}

export function WordExplainer({ text }: { text: string }) {
  return <>{text.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? <span key={index}>{part}</span> : <WordPopover key={index} word={part} />)}</>;
}
