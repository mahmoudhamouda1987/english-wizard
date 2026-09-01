"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PageHeader } from "@/app/components/page-header";
import { READING_ACTIVITIES } from "@/src/domain/content-library";
import type { ReadingActivity } from "@/src/domain/learning-systems";
import type { CEFRLevel } from "@/src/domain/learner";
import { WordExplainer } from "@/app/components/WordPopover";
import { IconBook, IconCheck, IconChevron, IconClock, IconClose } from "@/app/components/nav-icons";

/* ------------------------------------------------------------------ */
/* Reading Engine — library (Part 43) + reading studio (Parts 44/45).  */
/* Content source: READING_ACTIVITIES in src/domain/content-library.ts */
/* (21 texts across Pre-A1…C2). Questions and answer keys are reused   */
/* verbatim from the data; the choice options below sit around the     */
/* existing answer key — the key itself is never invented here.        */
/* ------------------------------------------------------------------ */

const LEVELS: Array<CEFRLevel | "All"> = ["All", "Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_SET = new Set<string>(["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"]);

type Genre = "Everyday text" | "Advertisement" | "Review" | "Article" | "Essay & argument";
type Topic = "Daily life" | "Travel" | "Work & study" | "Science & health" | "Society & technology" | "Environment" | "Language & ideas";
type ReadingKind = "Quick read" | "Standard read" | "In-depth read";

const GENRES: Genre[] = ["Everyday text", "Advertisement", "Review", "Article", "Essay & argument"];
const TOPICS: Topic[] = ["Daily life", "Travel", "Work & study", "Science & health", "Society & technology", "Environment", "Language & ideas"];
const KINDS: ReadingKind[] = ["Quick read", "Standard read", "In-depth read"];

const SKILL_LABELS: Record<string, string> = {
  main_idea: "Main idea",
  detail: "Detail",
  inference: "Inference",
  tone: "Tone",
  argument: "Writer&rsquo;s purpose",
};

/** Refined visible labels where the question is plainly a different type. */
const TYPE_LABEL_OVERRIDES: Record<string, string> = {
  "read-c1-econ:q3": "Vocabulary in context",
  "read-c1-teams:q3": "Paraphrase",
  "read-c2-literary:q3": "Vocabulary in context",
};

/** Library metadata: genre/topic classification and a one-line description. */
const LIBRARY_META: Record<string, { genre: Genre; topic: Topic; blurb: string }> = {
  "read-prea1-signs": { genre: "Everyday text", topic: "Daily life", blurb: "Four everyday signs: exit, open, closed and the bus stop." },
  "read-prea1-airport": { genre: "Everyday text", topic: "Travel", blurb: "Airport words for travellers — gates, passports and departures." },
  "read-prea1-menu": { genre: "Everyday text", topic: "Daily life", blurb: "A café price list with coffee, tea, water and cake." },
  "read-a1-routine": { genre: "Everyday text", topic: "Daily life", blurb: "Omar's morning, told in three short sentences." },
  "read-a1-weather": { genre: "Everyday text", topic: "Daily life", blurb: "A short weather report with one clear piece of advice." },
  "read-a1-messages": { genre: "Everyday text", topic: "Daily life", blurb: "Two friends arrange to meet — a five-line text exchange." },
  "read-a2-travel": { genre: "Everyday text", topic: "Travel", blurb: "A station notice explaining a delay and where to wait." },
  "read-a2-job": { genre: "Advertisement", topic: "Work & study", blurb: "A café job advert: pay, hours and what matters most." },
  "read-a2-hotel": { genre: "Review", topic: "Travel", blurb: "A balanced short review of a city hotel stay." },
  "read-b1-work": { genre: "Article", topic: "Work & study", blurb: "How professionals really build skills — training, feedback, practice." },
  "read-b1-sleep": { genre: "Article", topic: "Science & health", blurb: "What research says about sleep, memory and reaction times." },
  "read-b1-bikes": { genre: "Article", topic: "Society & technology", blurb: "A city's free bicycles change travel behaviour in an unexpected way." },
  "read-b2-policy": { genre: "Essay & argument", topic: "Work & study", blurb: "Two sides of the flexible-work debate, weighed by the evidence." },
  "read-b2-hiring": { genre: "Article", topic: "Society & technology", blurb: "What happens when algorithms screen job applications." },
  "read-b2-climate": { genre: "Article", topic: "Environment", blurb: "Cooling hot cities — and the argument over who pays first." },
  "read-c1-analysis": { genre: "Essay & argument", topic: "Language & ideas", blurb: "On qualifying claims when the evidence runs short." },
  "read-c1-teams": { genre: "Article", topic: "Work & study", blurb: "Why distributed teams swap ambient awareness for deliberate ritual." },
  "read-c1-econ": { genre: "Article", topic: "Society & technology", blurb: "Automation's winners and losers — arithmetic versus justice." },
  "read-c2-rhetoric": { genre: "Essay & argument", topic: "Language & ideas", blurb: "How wording widens or narrows what readers may infer." },
  "read-c2-accountability": { genre: "Essay & argument", topic: "Society & technology", blurb: "When harm has a thousand authors, who answers for it?" },
  "read-c2-literary": { genre: "Essay & argument", topic: "Language & ideas", blurb: "Unreliable narrators and the reader's willing complicity." },
};

/**
 * Choice options per question, keyed `readingId:questionId`. The FIRST entry
 * is always the answer taken from the data's answer key; the remaining
 * entries are clearly wrong options grounded in the same passage. Questions
 * and keys themselves come verbatim from READING_ACTIVITIES.
 */
const CHOICES: Record<string, string[]> = {
  "read-prea1-signs:q1": ["BUS STOP", "EXIT", "OPEN"],
  "read-prea1-airport:q1": ["DEPARTURES", "ARRIVALS", "GATE 5"],
  "read-prea1-airport:q2": ["PASSPORT", "BAGGAGE", "GATE 5"],
  "read-prea1-menu:q1": ["CAKE", "COFFEE", "WATER"],
  "read-prea1-menu:q2": ["WATER", "TEA", "COFFEE"],
  "read-a1-routine:q1": ["At eight", "At seven", "At nine"],
  "read-a1-weather:q1": ["Rain", "Snow", "Sunshine"],
  "read-a1-weather:q2": ["An umbrella", "A coat", "A sunhat"],
  "read-a1-messages:q1": ["He is busy", "He is free", "He is away"],
  "read-a1-messages:q2": ["Friday", "Tomorrow", "Saturday"],
  "read-a2-travel:q1": ["Heavy rain", "A signal failure", "Too many passengers"],
  "read-a2-travel:q2": ["On platform three", "On platform one", "Outside the station"],
  "read-a2-job:q1": ["No — experience is helpful but not necessary", "Yes — experience is essential", "Only weekend experience is needed"],
  "read-a2-job:q2": ["At weekends", "On weekdays only", "Every evening"],
  "read-a2-job:q3": ["Free meals", "Free transport", "Extra pay at night"],
  "read-a2-hotel:q1": ["The room was clean", "The wifi was fast", "Breakfast lasted all morning"],
  "read-a2-hotel:q2": ["The wifi did not work", "The room was dirty", "The staff were rude"],
  "read-a2-hotel:q3": ["Yes — good value for a short stay", "No — the hotel is poor value", "The reviewer does not say"],
  "read-b1-work:q1": ["Formal training with feedback and real-world practice", "Formal training on its own", "Challenging projects without any training"],
  "read-b1-sleep:q1": ["Seven to eight hours", "Fewer than six hours", "More than ten hours"],
  "read-b1-sleep:q2": ["That they have adapted", "That they need more sleep", "That tests show they are quick"],
  "read-b1-sleep:q3": ["Slower reaction times", "Faster reaction times", "No difference at all"],
  "read-b1-bikes:q1": ["That traffic would fall", "That walking would fall", "That parking fees would rise"],
  "read-b1-bikes:q2": ["Most trips replaced short walks", "Most trips replaced car journeys", "Nothing changed at all"],
  "read-b1-bikes:q3": ["Higher parking fees", "The free bicycles", "A public awareness campaign"],
  "read-b2-policy:q1": ["That flexible work improves retention", "That flexible work raises coordination costs", "That flexible work has no effect"],
  "read-b2-policy:q2": ["The outcome depends on job design and management practice", "Flexible work always succeeds", "The evidence supports the critics"],
  "read-b2-hiring:q1": ["Efficiency and consistency", "Creativity and empathy", "Lower staffing costs"],
  "read-b2-hiring:q2": ["They can reproduce past biases at scale", "They are too slow for large employers", "They reject every application automatically"],
  "read-b2-hiring:q3": ["Requiring human review of automated rejections", "Banning screening software outright", "Leaving employers entirely unregulated"],
  "read-b2-climate:q1": ["White roofs and street trees", "Air conditioning in every home", "Closing city centres to traffic"],
  "read-b2-climate:q2": ["The upfront cost", "The measures do not work at all", "Heatwaves are not a real problem"],
  "read-b2-climate:q3": ["Heatwaves already cost more in lost productivity and healthcare", "Roof paint is cheaper than planting trees", "Insurance companies will cover the cost"],
  "read-c1-analysis:q1": ["Qualify claims rather than convert uncertainty into confidence", "State the claim with full confidence", "Leave the uncertain evidence out"],
  "read-c1-analysis:q2": ["Careful reasoning under uncertainty", "Confident persuasion", "Scepticism towards all evidence"],
  "read-c1-teams:q1": ["Informal coordination disappears", "They lack the right tools", "Video calls are too expensive"],
  "read-c1-teams:q2": ["A corridor conversation, an overheard decision, a glance", "Written decision logs", "Predictable stand-up meetings"],
  "read-c1-teams:q3": ["Rituals deliberately replace ambient awareness", "Rituals emerge naturally without planning", "Good architecture removes the need for ritual"],
  "read-c1-teams:q4": ["Sceptical of how much they transmit", "Enthusiastic about their reach", "Neutral and purely descriptive"],
  "read-c1-econ:q1": ["Transitions were net-positive overall yet unevenly shared", "Automation has been a catastrophe for most workers", "Automation created no new jobs at all"],
  "read-c1-econ:q2": ["Treating the average outcome as everyone's outcome", "Ignoring technology altogether", "Focusing too much on individuals"],
  "read-c1-econ:q3": ["A statistical gain does not guarantee fairness for individuals", "Mathematics should decide public policy", "Statistics are always unjust"],
  "read-c2-rhetoric:q1": ["What an audience may infer from the wording", "Only the beauty of the prose", "The truth of the underlying facts"],
  "read-c2-rhetoric:q2": ["Because wording shapes what audiences may infer", "Because audiences rarely read carefully", "Because precision makes arguments longer"],
  "read-c2-accountability:q1": ["Harm emerges from many micro-decisions, not one actor", "The harmful system no longer exists", "The law has no courts for technology"],
  "read-c2-accountability:q2": ["The law's focus on intent, negligence and a guilty hand", "The victims' pursuit of compensation", "The systems' statistical behaviour"],
  "read-c2-accountability:q3": ["Legislate against what systems predictably do", "Legislate against what systems intend", "Leave emerging systems unlegislated"],
  "read-c2-literary:q1": ["They join the narrator in a flattering self-deception", "They see through the narrator immediately", "They abandon the book in protest"],
  "read-c2-literary:q2": ["The reader's willingness to be deceived is the real subject", "Critics are not clever enough", "The narrator deceives nobody"],
  "read-c2-literary:q3": ["The text tests the reader's own self-serving readings", "The text checks the reader's spelling", "The text audits the publisher's accounts"],
};

interface ProgressEntry {
  answered: number;
  total: number;
  correct: number;
  done: boolean;
  answers?: Record<string, string>;
}

const PROGRESS_KEY = "ew-reading-progress-v1";
const FONT_KEY = "ew-reading-font-size";
const FONT_STEPS = [15, 16, 17, 18.5, 20, 22];

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function readingKind(reading: ReadingActivity): ReadingKind {
  const words = wordCount(reading.passage);
  if (words <= 25) return "Quick read";
  if (words <= 55) return "Standard read";
  return "In-depth read";
}

function estimatedMinutes(reading: ReadingActivity): number {
  return Math.max(1, Math.ceil(wordCount(reading.passage) / 90));
}

function libraryMeta(reading: ReadingActivity) {
  const meta = LIBRARY_META[reading.id];
  if (meta) return meta;
  return { genre: "Article" as Genre, topic: "Daily life" as Topic, blurb: `${reading.passage.split(/[.!?]/)[0]}.` };
}

function optionsFor(readingId: string, questionId: string, fallback: string): string[] {
  return CHOICES[`${readingId}:${questionId}`] ?? [fallback];
}

/** Deterministic rotation so the correct option is not always listed first (no hydration mismatch). */
function displayOrderFor(key: string, options: string[]): string[] {
  const shift = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % options.length;
  return options.map((_, index) => options[(index + shift) % options.length]);
}

function correctCountFor(reading: ReadingActivity, answerMap: Record<string, string>): number {
  return reading.comprehensionQuestions.filter(
    (q) => answerMap[`${reading.id}:${q.id}`] === optionsFor(reading.id, q.id, q.answer)[0],
  ).length;
}

function LibrarySkeleton() {
  return (
    <section aria-busy="true" aria-label="Loading the reading library">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" style={{ width: "62%" }} />
      <div className="lib-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="lib-card" aria-hidden="true">
            <div className="lc-top">
              <div className="skeleton skeleton-text" style={{ width: "55%", height: 16 }} />
              <div className="skeleton skeleton-text" style={{ width: "88%" }} />
              <div className="skeleton skeleton-text" style={{ width: "72%" }} />
            </div>
            <div className="lc-foot">
              <div className="skeleton skeleton-text" style={{ width: "58%", margin: 0 }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LibraryCard({ reading, entry, learnerLevel, onOpen }: {
  reading: ReadingActivity;
  entry?: ProgressEntry;
  learnerLevel: CEFRLevel | null;
  onOpen: () => void;
}) {
  const meta = libraryMeta(reading);
  const total = reading.comprehensionQuestions.length;
  const done = Boolean(entry?.done);
  const partial = !done && (entry?.answered ?? 0) > 0;
  const percent = entry && entry.total ? Math.round((entry.answered / entry.total) * 100) : 0;
  const minutes = estimatedMinutes(reading);
  return (
    <article className="lib-card">
      <div className="lc-top">
        <div className="lc-badges">
          <span className="lc-badge level">{reading.level}</span>
          <span className="lc-badge">{meta.genre}</span>
          {reading.level === learnerLevel ? <span className="lc-badge skill">Your level</span> : null}
          {done ? <span className="lc-badge skill">Completed</span> : null}
        </div>
        <h3>
          <button type="button" className="lc-open" onClick={onOpen} aria-label={`Open reading: ${reading.title}, ${reading.level} ${meta.genre}, about ${minutes} minute read, ${total} question${total === 1 ? "" : "s"}`}>
            {reading.title}
          </button>
        </h3>
        <p>{meta.blurb}</p>
      </div>
      <div className="lc-foot">
        <span>≈ {minutes} min · {total} question{total === 1 ? "" : "s"}</span>
        {partial && entry ? (
          <span className="lc-progress" role="img" aria-label={`Partially read: ${entry.answered} of ${entry.total} questions answered`}>
            <span style={{ width: `${Math.max(6, percent)}%` }} />
          </span>
        ) : null}
        {done && entry ? <span>{Math.round((entry.correct / Math.max(1, entry.total)) * 100)}%</span> : null}
        {!partial && !done ? <span>{readingKind(reading)}</span> : null}
      </div>
    </article>
  );
}

function QuestionBlock({ reading, question, chosen, onChoose }: {
  reading: ReadingActivity;
  question: ReadingActivity["comprehensionQuestions"][number];
  chosen?: string;
  onChoose: (questionId: string, option: string) => void;
}) {
  const key = `${reading.id}:${question.id}`;
  const options = optionsFor(reading.id, question.id, question.answer);
  const correct = options[0];
  const ordered = displayOrderFor(key, options);
  const typeLabel = TYPE_LABEL_OVERRIDES[key] ?? SKILL_LABELS[question.skill] ?? "Comprehension";
  const answered = Boolean(chosen);
  return (
    <section className="rq-card" aria-labelledby={`rq-${key}`}>
      <div className="rq-head">
        <span className="rq-type">{typeLabel}</span>
        {answered ? (
          chosen === correct ? (
            <span className="rq-state correct"><IconCheck size={13} /> Correct</span>
          ) : (
            <span className="rq-state wrong"><IconClose size={13} /> Not quite</span>
          )
        ) : null}
      </div>
      <h3 id={`rq-${key}`} className="rq-question"><WordExplainer text={question.question} /></h3>
      <div className="rq-options" role="group" aria-labelledby={`rq-${key}`}>
        {ordered.map((option, index) => {
          const state = !answered ? undefined : option === correct ? "correct" : option === chosen ? "wrong" : undefined;
          return (
            <button
              key={option}
              type="button"
              className="q-option"
              data-state={state}
              disabled={answered}
              aria-pressed={chosen === option}
              onClick={() => onChoose(question.id, option)}
            >
              <span className="q-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className="rq-feedback" aria-live="polite">
          <strong>Model answer:</strong> {question.answer}
        </p>
      ) : null}
    </section>
  );
}

export default function ReadingPage() {
  const [booting, setBooting] = useState(true);
  const [learnerLevel, setLearnerLevel] = useState<CEFRLevel | null>(null);
  const [levelFilter, setLevelFilter] = useState<CEFRLevel | "All">("All");
  const [genreFilter, setGenreFilter] = useState<string>("All");
  const [topicFilter, setTopicFilter] = useState<string>("All");
  const [kindFilter, setKindFilter] = useState<string>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evidenceState, setEvidenceState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [transferText, setTransferText] = useState("");
  const [transferState, setTransferState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showWords, setShowWords] = useState(false);
  const [fontIndex, setFontIndex] = useState(2);
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});
  const levelTouched = useRef(false);

  useEffect(() => {
    // Restore persisted reader preferences after hydration (async, no sync setState in the effect body).
    void Promise.resolve().then(() => {
      try {
        const raw = window.localStorage.getItem(PROGRESS_KEY);
        if (raw) setProgress(JSON.parse(raw) as Record<string, ProgressEntry>);
        const storedFont = window.localStorage.getItem(FONT_KEY);
        if (storedFont) {
          const parsed = Number(storedFont);
          if (Number.isInteger(parsed) && parsed >= 0 && parsed < FONT_STEPS.length) setFontIndex(parsed);
        }
      } catch { /* private browsing — progress stays in memory */ }
    });

    let cancelled = false;
    void (async () => {
      let level: CEFRLevel | null = null;
      try {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json() as { level?: unknown };
          if (typeof data.level === "string" && LEVEL_SET.has(data.level)) level = data.level as CEFRLevel;
        }
      } catch { /* fall through to profile */ }
      if (!level) {
        try {
          const response = await fetch("/api/profile", { cache: "no-store" });
          if (response.ok) {
            const data = await response.json() as { profile?: { targetLevel?: unknown } };
            const target = data.profile?.targetLevel;
            if (typeof target === "string" && LEVEL_SET.has(target)) level = target as CEFRLevel;
          }
        } catch { /* stay on All levels */ }
      }
      if (cancelled) return;
      if (level) {
        setLearnerLevel(level);
        if (!levelTouched.current) setLevelFilter(level);
      }
      setBooting(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleReadings = useMemo(
    () => READING_ACTIVITIES.filter((reading) => {
      const meta = libraryMeta(reading);
      return (levelFilter === "All" || reading.level === levelFilter)
        && (genreFilter === "All" || meta.genre === genreFilter)
        && (topicFilter === "All" || meta.topic === topicFilter)
        && (kindFilter === "All" || readingKind(reading) === kindFilter);
    }),
    [levelFilter, genreFilter, topicFilter, kindFilter],
  );

  const selected = useMemo(() => READING_ACTIVITIES.find((r) => r.id === selectedId) ?? null, [selectedId]);

  const nextReading = useMemo(() => {
    if (!selected) return null;
    const sameLevel = READING_ACTIVITIES.filter((r) => r.level === selected.level && r.id !== selected.id);
    return sameLevel.find((r) => !progress[r.id]?.done) ?? sameLevel[0] ?? null;
  }, [selected, progress]);

  function persistProgress(readingId: string, entry: ProgressEntry) {
    setProgress((previous) => {
      const next = { ...previous, [readingId]: entry };
      try { window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }

  function openReading(id: string) {
    const reading = READING_ACTIVITIES.find((r) => r.id === id);
    if (!reading) return;
    const entry = progress[id];
    const seeded = entry?.answers && Object.keys(entry.answers).length > 0 ? { ...entry.answers } : {};
    setAnswers(seeded);
    setEvidenceState("idle");
    setTransferText("");
    setTransferState("idle");
    setShowTransfer(false);
    setShowWords(false);
    setSelectedId(id);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* ignore */ }
  }

  function backToLibrary() {
    setSelectedId(null);
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch { /* ignore */ }
  }

  function chooseOption(reading: ReadingActivity, questionId: string, option: string) {
    const key = `${reading.id}:${questionId}`;
    if (answers[key]) return;
    const next = { ...answers, [key]: option };
    setAnswers(next);
    const total = reading.comprehensionQuestions.length;
    const answered = Object.keys(next).length;
    const correct = correctCountFor(reading, next);
    persistProgress(reading.id, { answered, total, correct, done: answered === total, answers: next });
    if (answered === total) void saveEvidence(reading, next);
  }

  async function saveEvidence(reading: ReadingActivity, answerMap: Record<string, string>) {
    const total = reading.comprehensionQuestions.length;
    const correct = correctCountFor(reading, answerMap);
    const score = total ? Math.round((correct / total) * 100) : 0;
    setEvidenceState("saving");
    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "STANDARD_JOURNEY",
          missionId: `reading:${reading.level.toLowerCase()}`,
          objectiveId: `reading:${reading.level.toLowerCase()}:familiar`,
          capabilityIds: [`reading:${reading.level.toLowerCase()}`],
          modality: "READING",
          outcome: score === 100 ? "CORRECT" : "PARTIAL",
          score,
          confidence: 0.75,
          level: reading.level,
          context: "FAMILIAR",
          errorTags: score < 70 ? ["reading-comprehension"] : [],
        }),
      });
      if (!response.ok) throw new Error("save-failed");
      setEvidenceState("saved");
    } catch {
      setEvidenceState("error");
    }
  }

  async function submitTransfer(reading: ReadingActivity) {
    if (!transferText.trim()) return;
    setTransferState("saving");
    try {
      const response = await fetch("/api/evidence", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionType: "STANDARD_JOURNEY",
          missionId: `reading:${reading.level.toLowerCase()}`,
          objectiveId: `reading:${reading.level.toLowerCase()}:transfer`,
          capabilityIds: [`reading:${reading.level.toLowerCase()}`],
          modality: "TRANSFER",
          outcome: "PARTIAL",
          score: 0,
          confidence: 0,
          level: reading.level,
          context: "TRANSFER",
          errorTags: ["awaiting-assessment"],
        }),
      });
      if (!response.ok) throw new Error("save-failed");
      setTransferState("saved");
      setTransferText("");
    } catch {
      setTransferState("error");
    }
  }

  function applyFont(index: number) {
    const clamped = Math.max(0, Math.min(FONT_STEPS.length - 1, index));
    setFontIndex(clamped);
    try { window.localStorage.setItem(FONT_KEY, String(clamped)); } catch { /* ignore */ }
  }

  function clearFilters() {
    setLevelFilter("All");
    setGenreFilter("All");
    setTopicFilter("All");
    setKindFilter("All");
  }

  /* ---------------- Reader view (Part 45) ---------------- */
  if (selected) {
    const meta = libraryMeta(selected);
    const total = selected.comprehensionQuestions.length;
    const answered = Object.keys(answers).length;
    const percent = total ? Math.round((answered / total) * 100) : 0;
    const correct = correctCountFor(selected, answers);
    const complete = total > 0 && answered === total;
    return (
      <main id="main-content" className="reading-shell">
        <div className="reading-topbar">
          <button type="button" className="button secondary r-back" onClick={backToLibrary}>
            <IconChevron size={15} /> Back to library
          </button>
          <div className="reading-meta" aria-label="Where this text sits in the library">
            <span className="chip">{selected.level}</span>
            <span className="chip">{meta.genre}</span>
            <span className="chip">{readingKind(selected)}</span>
          </div>
        </div>

        <PageHeader
          eyebrow={`Reading studio · ${selected.level}`}
          title={selected.title}
          purpose={meta.blurb}
        />

        <div className="reading-stage">
          <article
            className="reading-pane"
            style={{ "--reading-fs": `${FONT_STEPS[fontIndex]}px` } as CSSProperties}
            aria-label="Reading text"
          >
            <div className="reading-meta" role="group" aria-label="Reading settings and progress">
              <span className="r-meta-item"><IconClock size={14} /> ≈ {estimatedMinutes(selected)} min read</span>
              <span className="r-meta-item">{wordCount(selected.passage)} words</span>
              <span className="track" role="img" aria-label={`${answered} of ${total} questions answered`}>
                <span style={{ width: `${Math.max(answered > 0 ? 6 : 0, percent)}%` }} />
              </span>
              <span className="r-meta-item">{answered}/{total} answered</span>
              <div className="reading-controls">
                <button type="button" aria-label="Decrease text size" onClick={() => applyFont(fontIndex - 1)} disabled={fontIndex === 0}>A−</button>
                <button type="button" aria-label="Increase text size" onClick={() => applyFont(fontIndex + 1)} disabled={fontIndex === FONT_STEPS.length - 1}>A+</button>
              </div>
            </div>

            <p className="r-body"><WordExplainer text={selected.passage} /></p>

            {selected.wordRecognitionTargets.length > 0 ? (
              <div className="r-extra">
                <button type="button" className="button secondary r-toggle" aria-expanded={showWords} onClick={() => setShowWords((v) => !v)}>
                  {showWords ? "Hide key vocabulary" : "Show key vocabulary"}
                </button>
                {showWords ? (
                  <ul className="r-chips" aria-label="Key words from this text">
                    {selected.wordRecognitionTargets.map((target) => (
                      <li className="chip" key={target}><WordExplainer text={target} /></li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {selected.transferPrompt ? (
              <div className="r-extra">
                <button type="button" className="button secondary r-toggle" aria-expanded={showTransfer} onClick={() => setShowTransfer((v) => !v)}>
                  {showTransfer ? "Hide transfer task" : "Show transfer task"}
                </button>
                {showTransfer ? (
                  <div className="r-transfer">
                    <p className="r-transfer-prompt"><WordExplainer text={selected.transferPrompt} /></p>
                    <textarea
                      rows={4}
                      value={transferText}
                      onChange={(event) => setTransferText(event.target.value)}
                      placeholder="Write your response…"
                      aria-label="Your transfer response"
                    />
                    <div className="r-transfer-actions">
                      <button
                        type="button"
                        className="button"
                        disabled={!transferText.trim() || transferState === "saving"}
                        onClick={() => void submitTransfer(selected)}
                      >
                        {transferState === "saving" ? "Saving…" : "Save transfer attempt"}
                      </button>
                      {transferState === "saved" ? (
                        <span className="subtle">Recorded — the attempt is stored without an invented score.</span>
                      ) : null}
                      {transferState === "error" ? (
                        <span className="r-error-text" role="alert">Could not save just now — please try again.</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>

          <aside className="question-panel" aria-label="Comprehension questions">
            <div className="panel-title">
              <h2>Comprehension</h2>
              <span>{answered} of {total}</span>
            </div>
            {selected.comprehensionQuestions.map((question) => (
              <QuestionBlock
                key={question.id}
                reading={selected}
                question={question}
                chosen={answers[`${selected.id}:${question.id}`]}
                onChoose={(questionId, option) => chooseOption(selected, questionId, option)}
              />
            ))}
          </aside>
        </div>

        {complete ? (
          <section className="rq-done" aria-label="Reading session complete" aria-live="polite">
            <div className="panel-title">
              <h2>Session complete</h2>
              <span>{correct}/{total} correct</span>
            </div>
            <p className="rq-done-summary">
              {correct === total
                ? "A full set of correct answers — strong evidence at this level."
                : `You answered ${correct} of ${total} correctly. Re-read the passage once more, then carry the same skill into the next text.`}
            </p>
            {evidenceState === "saving" ? <p className="subtle">Recording your evidence…</p> : null}
            {evidenceState === "saved" ? (
              <p className="subtle rq-done-saved"><IconCheck size={13} /> Added to your learning evidence.</p>
            ) : null}
            {evidenceState === "error" ? (
              <div className="state-card error" role="alert">
                <strong>We could not record your evidence.</strong>
                <p>Your answers are safe on this device — try again to add this session to your progression.</p>
                <button type="button" className="button" onClick={() => void saveEvidence(selected, answers)}>Try again</button>
              </div>
            ) : null}
            <div className="rq-done-actions">
              {nextReading ? (
                <button type="button" className="button" onClick={() => openReading(nextReading.id)}>
                  <IconBook size={15} /> {progress[nextReading.id]?.done ? "Read again" : "Next reading"}: {nextReading.title}
                </button>
              ) : (
                <p className="empty">You have completed every reading at {selected.level} — further texts arrive as the library grows.</p>
              )}
              <button type="button" className="button secondary" onClick={backToLibrary}>Back to library</button>
            </div>
          </section>
        ) : null}
      </main>
    );
  }

  /* ---------------- Library view (Part 43) ---------------- */
  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Reading Studio"
        title="Reading"
        purpose="Choose a text at your level, read it comfortably, then check your understanding — organised by CEFR level, genre and topic."
      />
      {booting ? (
        <LibrarySkeleton />
      ) : (
        <>
          <div className="filters" role="group" aria-label="Filter the reading library">
            <span className="f-label">Level</span>
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                className="f-chip"
                data-active={levelFilter === level}
                aria-pressed={levelFilter === level}
                onClick={() => { levelTouched.current = true; setLevelFilter(level); }}
              >
                {level === "All" ? "All" : level}{level === learnerLevel ? " · you" : ""}
              </button>
            ))}
            <span className="f-label">Genre</span>
            <select aria-label="Filter by genre" value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}>
              {["All", ...GENRES].map((option) => <option key={option} value={option}>{option === "All" ? "All genres" : option}</option>)}
            </select>
            <span className="f-label">Topic</span>
            <select aria-label="Filter by topic" value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
              {["All", ...TOPICS].map((option) => <option key={option} value={option}>{option === "All" ? "All topics" : option}</option>)}
            </select>
            <span className="f-label">Length</span>
            <select aria-label="Filter by reading length" value={kindFilter} onChange={(event) => setKindFilter(event.target.value)}>
              {["All", ...KINDS].map((option) => <option key={option} value={option}>{option === "All" ? "All lengths" : option}</option>)}
            </select>
            <span className="filters-count">{visibleReadings.length} of {READING_ACTIVITIES.length} readings</span>
          </div>

          <section aria-labelledby="reading-library-heading">
            <h2 id="reading-library-heading" className="r-section-h">Reading library</h2>
            {visibleReadings.length === 0 ? (
              <div className="state-card info" role="status">
                <strong>No readings match these filters yet.</strong>
                <p>The library is organised by CEFR level first, then genre and topic. Try a different combination, or set the level back to All, to see every text from Pre-A1 to C2.</p>
                <button type="button" className="button secondary" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="lib-grid">
                {visibleReadings.map((reading) => (
                  <LibraryCard
                    key={reading.id}
                    reading={reading}
                    entry={progress[reading.id]}
                    learnerLevel={learnerLevel}
                    onOpen={() => openReading(reading.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
