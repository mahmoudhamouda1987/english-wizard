"use client";

import { useMemo, useState } from "react";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";
import type { CEFRLevel } from "@/src/domain/curriculum";

interface WordEntry { word: string; type: string; meaning: string; ar: string; example: string }

const BANK: Record<string, WordEntry[]> = {
  A1: [
    { word: "appointment", type: "noun", meaning: "an arranged meeting at a fixed time", ar: "موعد", example: "I have a dentist appointment on Monday." },
    { word: "routine", type: "noun", meaning: "things you do regularly in the same order", ar: "روتين", example: "My morning routine starts with coffee." },
    { word: "introduce", type: "verb", meaning: "to tell someone another person's name for the first time", ar: "يقدّم", example: "Let me introduce my colleague Sara." },
    { word: "neighbour", type: "noun", meaning: "a person living next to or near you", ar: "جار", example: "Our neighbour waters our plants when we travel." },
    { word: "station", type: "noun", meaning: "a place where trains or buses stop", ar: "محطة", example: "Meet me at the train station at six." },
    { word: "schedule", type: "noun", meaning: "a plan that shows times of events", ar: "جدول", example: "The bus schedule changes on Fridays." },
    { word: "borrow", type: "verb", meaning: "to take and use something and return it later", ar: "يستعير", example: "Can I borrow your pen, please?" },
    { word: "weather", type: "noun", meaning: "the condition of air: sun, rain, wind", ar: "طقس", example: "The weather is sunny today." },
    { word: "hobby", type: "noun", meaning: "an activity you enjoy in free time", ar: "هواية", example: "Painting is my favourite hobby." },
    { word: "receipt", type: "noun", meaning: "paper showing you paid for something", ar: "إيصال", example: "Keep the receipt for returns." },
    { word: "delicious", type: "adjective", meaning: "tasting very good", ar: "لذيذ", example: "This soup is delicious!" },
    { word: "arrive", type: "verb", meaning: "to reach a place", ar: "يصل", example: "We arrive in London at noon." },
  ],
  A2: [
    { word: "confident", type: "adjective", meaning: "sure that you can do something well", ar: "واثق", example: "She feels confident before tests." },
    { word: "improve", type: "verb", meaning: "to become better", ar: "يحسّن", example: "Reading daily improves vocabulary." },
    { word: "afford", type: "verb", meaning: "to have enough money for something", ar: "يستطيع شراء", example: "We can't afford a new car this year." },
    { word: "commute", type: "verb", meaning: "to travel to work every day", ar: "يتنقل للعمل", example: "He commutes by bicycle." },
    { word: "generous", type: "adjective", meaning: "happy to give more than expected", ar: "كريم / سخي", example: "It was generous of you to help." },
    { word: "recommend", type: "verb", meaning: "to say something is good to try", ar: "يوصي", example: "I recommend the fish soup." },
    { word: "reliable", type: "adjective", meaning: "able to be trusted to work well", ar: "موثوق", example: "She is a reliable teammate." },
    { word: "avoid", type: "verb", meaning: "to keep away from something", ar: "يتجنب", example: "Avoid rush-hour traffic." },
    { word: "achieve", type: "verb", meaning: "to succeed in doing something", ar: "يحقق", example: "You can achieve your target this month." },
    { word: "complain", type: "verb", meaning: "to say you are not satisfied", ar: "يشتكو", example: "Guests complained about the noise." },
    { word: "convenient", type: "adjective", meaning: "easy and useful for you", ar: "ملائم", example: "Is Tuesday convenient for you?" },
    { word: "decide", type: "verb", meaning: "to choose after thinking", ar: "يقرر", example: "We decided to stay home." },
  ],
  B1: [
    { word: "negotiate", type: "verb", meaning: "to discuss to reach an agreement", ar: "يتفاوض", example: "They negotiated a better price." },
    { word: "assumption", type: "noun", meaning: "something accepted as true without proof", ar: "افتراض", example: "That's a common assumption." },
    { word: "significant", type: "adjective", meaning: "large or important enough to matter", ar: "هام / كبير", example: "There was a significant improvement." },
    { word: "reluctant", type: "adjective", meaning: "not willing at first", ar: "متردد", example: "He was reluctant to speak first." },
    { word: "thorough", type: "adjective", meaning: "complete and careful", ar: "شامل / دقيق", example: "She gave a thorough answer." },
    { word: "deadline", type: "noun", meaning: "the latest time something must finish", ar: "موعد نهائي", example: "The deadline is Thursday noon." },
    { word: "persuade", type: "verb", meaning: "to make someone agree by giving reasons", ar: "يقنع", example: "Ads persuade people to buy." },
    { word: "flexible", type: "adjective", meaning: "able to change easily when needed", ar: "مرن", example: "Our hours are flexible." },
    { word: "acknowledge", type: "verb", meaning: "to accept or admit something exists/is true", ar: "يعترف / يقر بـ", example: "He acknowledged the mistake quickly." },
    { word: "sustainable", type: "adjective", meaning: "able to continue without harming the future", ar: "مستدام", example: "Sustainable growth protects jobs." },
    { word: "anticipate", type: "verb", meaning: "to expect something is coming", ar: "يتوقع", example: "We anticipate delays in July." },
    { word: "insight", type: "noun", meaning: "a clear deep understanding of something", ar: "بصيرة / فهم عميق", example: "Her talk gave real insight into the market." },
  ],
  B2: [
    { word: "compelling", type: "adjective", meaning: "so strong it convinces you", ar: "مقنع بقوة", example: "He made a compelling case." },
    { word: "drawback", type: "noun", meaning: "a disadvantage of something", ar: "عيب / جانب سلبي", example: "The main drawback is cost." },
    { word: "scrutiny", type: "noun", meaning: "careful detailed examination", ar: "تدقيق / فحص دقيق", example: "The plan came under scrutiny." },
    { word: "mitigate", type: "verb", meaning: "to make something bad less serious", ar: "يخفف", example: "Trees mitigate city heat." },
    { word: "nuance", type: "noun", meaning: "a very small difference in meaning", ar: "فرق دقيق", example: "Translation must capture nuance." },
    { word: "prevalent", type: "adjective", meaning: "common in a particular place or time", ar: "شائع", example: "Remote work is prevalent now." },
    { word: "advocate", type: "verb", meaning: "to publicly support an idea", ar: "يدعو لـ", example: "Doctors advocate regular exercise." },
    { word: "inevitable", type: "adjective", meaning: "certain to happen, unavoidable", ar: "محتوم", example: "Change was inevitable." },
    { word: "discrepancy", type: "noun", meaning: "a difference between things that should match", ar: "تناقض / تباين", example: "There is a discrepancy in the report." },
    { word: "leverage", type: "verb", meaning: "to use something to maximum advantage", ar: "يستفيد من", example: "Leverage your strengths." },
    { word: "resilient", type: "adjective", meaning: "able to recover quickly from difficulty", ar: "مرن / صامد", example: "Kids are surprisingly resilient." },
    { word: "substantiate", type: "verb", meaning: "to support a claim with evidence", ar: "يسند بالأدلة", example: "Data substantiates the claim." },
  ],
};

const LEVELS = ["A1", "A2", "B1", "B2"] as const;

export default function VocabularyPage() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>("A1");
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const words = BANK[level];
  const knownCount = useMemo(() => Object.values(known).filter(Boolean).length, [known]);

  function markKnown(entry: WordEntry) {
    setKnown((current) => ({ ...current, [entry.word]: !current[entry.word] }));
    if (!known[entry.word]) {
      void fetch("/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ skill: "vocabulary", objectiveId: `vocab:${entry.word.toLowerCase()}`, correct: true }),
      }).catch(() => undefined);
    }
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="🔤" title="Vocabulary builder" sub={`Level ${level} · ${words.length} high-value words with Arabic meanings, examples and audio. Mark what you truly know — it becomes learner evidence.`} />
      <Celebration trigger={knownCount > 0 && knownCount % 5 === 0 ? `k${knownCount}` : ""} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {LEVELS.map((l) => (
          <button key={l} className={l === level ? "button" : "button secondary"} onClick={() => setLevel(l)}>{l}</button>
        ))}
        <span className="streak-pill">✓ {knownCount}/{words.length} known</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 14 }}>
        {words.map((w) => {
          const isOpen = openIndex === words.indexOf(w);
          return (
            <article key={w.word} className="panel" style={{ margin: 0, padding: 18, display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <strong style={{ fontSize: 17 }}>{w.word}</strong>
                <small className="subtle">{w.type}</small>
              </div>
              {isOpen ? (
                <>
                  <p style={{ margin: 0 }}>{w.meaning}</p>
                  <p style={{ margin: 0 }} className="subtle">العربية: <strong>{w.ar}</strong></p>
                  <p className="example" style={{ margin: 0 }}>“{w.example}”</p>
                </>
              ) : (
                <button className="link-button" style={{ textAlign: "left", padding: 0 }} onClick={() => setOpenIndex(words.indexOf(w))}>Reveal meaning</button>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button className={known[w.word] ? "button secondary" : "button"} onClick={() => markKnown(w)}>{known[w.word] ? "✓ Known" : "I know this"}</button>
                <button className="button secondary" aria-label={`Listen to ${w.word}`} onClick={() => { if (typeof window === "undefined" || !("speechSynthesis" in window)) return; const u = new SpeechSynthesisUtterance(w.word); u.lang = "en-US"; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); }}>🔊</button>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
