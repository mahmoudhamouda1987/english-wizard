"use client";

import { useState } from "react";
import { speakText } from "@/src/domain/tts";

type WordInfo = { meaning: string; arabicMeaning: string; arabicAvailable?: boolean; pronunciation: string; partOfSpeech: string; source?: string };

export function speakWord(text: string, lang: "en-GB" | "ar-SA") {
  speakText(text, { lang, rate: 0.92 });
}

export function WordPopover({ word }: { word: string }) {
  const clean = word.replace(/[^A-Za-z'-]/g, "").toLowerCase();
  const [info, setInfo] = useState<WordInfo | null>(null);
  const [open, setOpen] = useState(false);
  // Lookup is deferred until the learner actually opens the popover — one
  // request per word, only for words the learner asks about.
  const [fetched, setFetched] = useState(false);

  function ensureInfo() {
    if (fetched || !clean) return;
    setFetched(true);
    fetch(`/api/word?word=${encodeURIComponent(clean)}`, { cache: "force-cache" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload: WordInfo | null) => {
        if (payload) setInfo(payload);
      })
      .catch(() => undefined);
  }

  if (!/^[a-z][a-z'-]*$/i.test(clean)) return <span>{word}</span>;

  return (
    <span
      tabIndex={0}
      onFocus={() => { ensureInfo(); setOpen(true); }}
      onBlur={() => setOpen(false)}
      onMouseEnter={() => { ensureInfo(); setOpen(true); }}
      onMouseLeave={() => setOpen(false)}
      style={{ position: "relative", cursor: "help", textDecoration: "underline dotted", textDecorationThickness: 1 }}
    >
      {word}
      {open && (
        <span role="tooltip" style={{ position: "absolute", zIndex: 20, left: 0, top: "calc(100% + 8px)", width: 260, padding: 14, borderRadius: 12, border: "1px solid #dfe3ec", background: "var(--bg-elevated)", boxShadow: "0 10px 30px rgba(20,20,40,.14)", display: "grid", gap: 7, color: "#25253a" }}>
          <strong>{clean}</strong>
          <span style={{ fontSize: 12, opacity: 0.7 }}>{info?.partOfSpeech ?? "word"}{info?.source ? ` · ${info.source}` : ""}</span>
          <span>{info?.meaning ?? "Looking up meaning…"}</span>
          <span dir="rtl" style={{ textAlign: "left" }}>
            <strong>المعنى بالعربية:</strong>{" "}
            {info?.arabicAvailable
              ? info.arabicMeaning
              : <em style={{ opacity: 0.75 }}>لا يوجد ترجمة موثوقة لهذه الكلمة في قاموسنا بعد — تجنّب الترجمة الآلية.</em>}
          </span>
          {info?.pronunciation && info.pronunciation !== "-" && (
            <span>Pronunciation: <code>{info.pronunciation}</code></span>
          )}
          <span style={{ display: "flex", gap: 6 }}>
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => speakWord(clean, "en-GB")}>🔊 English (UK)</button>
            {info?.arabicAvailable && (
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => speakWord(info.arabicMeaning, "ar-SA")}>🔊 العربية</button>
            )}
          </span>
        </span>
      )}
    </span>
  );
}

export function WordExplainer({ text }: { text: string }) {
  return <>{text.split(/(\s+)/).map((part, index) => /\s+/.test(part) ? <span key={index}>{part}</span> : <WordPopover key={index} word={part} />)}</>;
}
