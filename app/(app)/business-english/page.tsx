"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { levelIndex } from "@/src/domain/product-intelligence";
import { PROFESSIONAL_LIBRARY } from "@/src/domain/professional-library";
import { PROFESSIONAL_CURRICULUM, PROFESSIONAL_LEVELS } from "@/src/domain/professional-curriculum";
import { track } from "@/app/lib/track";

/** Single source of truth for level: the platform dashboard payload (Part 105). */
interface DashboardData {
  level: string;
  overallPercent: number;
}

/** Part 55 — the outcome model. Each card is a real deliverable, never a vocabulary list. */
const OUTCOMES = [
  {
    title: "Write this email",
    scenario: "A client is waiting for an update you do not have yet.",
    good: "Clear structure, a polite chase, and a commitment with a date.",
    href: "/writing",
    cta: "Open the Writing studio",
  },
  {
    title: "Prepare for this interview",
    scenario: "The job description is in front of you and the interview is this week.",
    good: "You can tell your story, answer the hard questions, and use their language.",
    href: "/business-english/actual-thing",
    cta: "Practise your actual thing",
  },
  {
    title: "Handle this customer complaint",
    scenario: "An angry customer wants far more than an apology.",
    good: "You stay calm, acknowledge properly, and move the talk to a fix.",
    href: "/roleplay",
    cta: "Role-play the complaint",
  },
  {
    title: "Run this meeting",
    scenario: "Thirty minutes, six people, one agenda that keeps drifting.",
    good: "Clear turns, crisp decisions, action points confirmed before you close.",
    href: "/roleplay",
    cta: "Role-play the meeting",
  },
  {
    title: "Give this presentation",
    scenario: "Five slides, one message, a room full of stakeholders.",
    good: "Steady delivery, signposted structure, and a close people remember.",
    href: "/pronunciation",
    cta: "Train your delivery",
  },
  {
    title: "Negotiate this situation",
    scenario: "The deadline is impossible and the other side will not move.",
    good: "You hold your position without losing the relationship.",
    href: "/roleplay",
    cta: "Role-play the negotiation",
  },
  {
    title: "Explain this problem",
    scenario: "Something has gone wrong and management wants to know why.",
    good: "Plain language, an honest cause, and a plan they can follow.",
    href: "/conversation",
    cta: "Practise explaining it",
  },
  {
    title: "Lead this discussion",
    scenario: "Your team looks to you to open, steer and close the conversation.",
    good: "You invite, steer and summarise — without dominating.",
    href: "/conversation",
    cta: "Practise leading",
  },
];

/** Module progression — every module maps to real surfaces, so every module has a real start action. */
const MODULES = [
  { id: "foundations", title: "Business Foundations", blurb: "Your role, your company, your working day — the ground everything stands on.", surfaces: [{ label: "Lessons", href: "/learn" }] },
  { id: "communication", title: "Professional Communication", blurb: "Clear, polite, effective messages in speech and in writing.", surfaces: [{ label: "Conversation", href: "/conversation" }, { label: "Say It Better", href: "/say-it-better" }] },
  { id: "meetings", title: "Meetings", blurb: "Follow the agenda, contribute with confidence, summarise decisions.", surfaces: [{ label: "Role-play", href: "/roleplay" }] },
  { id: "presentations", title: "Presentations", blurb: "Structure, delivery and the sounds that carry authority.", surfaces: [{ label: "Speaking Coach", href: "/pronunciation" }] },
  { id: "email", title: "Email", blurb: "Subject lines, tone, and requests that actually get answered.", surfaces: [{ label: "Writing studio", href: "/writing" }] },
  { id: "networking", title: "Networking", blurb: "Introductions and small talk that leads somewhere.", surfaces: [{ label: "Conversation", href: "/conversation" }] },
  { id: "negotiation", title: "Negotiation", blurb: "Push, concede and hold your position with grace.", surfaces: [{ label: "Role-play", href: "/roleplay" }] },
  { id: "leadership", title: "Leadership", blurb: "Lead discussions, delegate, and give difficult feedback.", surfaces: [{ label: "Thinking in English", href: "/thinking-in-english" }] },
  { id: "interviews", title: "Interviews", blurb: "Tell your story and answer the questions you fear.", surfaces: [{ label: "Practise Your Actual Thing", href: "/business-english/actual-thing" }] },
  { id: "problem-solving", title: "Workplace Problem Solving", blurb: "Explain problems, propose fixes, manage escalations.", surfaces: [{ label: "Scenes", href: "/scenes" }] },
];

const MODULE_STORAGE_KEY = "ew-business-module-progress";

/** A curated view of the professional library domains — architecture visibility only (Part 57). */
const TRACK_PREVIEW_IDS = ["general-business", "finance", "human-resources", "information-technology", "sales", "marketing", "customer-service", "logistics", "engineering", "consulting"];

export default function BusinessEnglishPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [authed, setAuthed] = useState(true);
  const [doneModules, setDoneModules] = useState<string[]>([]);

  useEffect(() => {
    track("product_page_opened", { product: "business_english" });
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as DashboardData;
        if (!cancelled) setData(d);
      })
      .catch(() => { if (!cancelled) setAuthed(false); });
    // Module ticks live in this browser only; read after hydration to avoid SSR mismatches.
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(MODULE_STORAGE_KEY);
        if (raw && !cancelled) {
          const parsed = JSON.parse(raw) as unknown;
          if (Array.isArray(parsed)) setDoneModules(parsed.filter((x): x is string => typeof x === "string"));
        }
      } catch { /* progress stays empty */ }
    });
    return () => { cancelled = true; };
  }, []);

  function toggleModule(id: string) {
    setDoneModules((prev) => {
      const next = prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id];
      try { window.localStorage.setItem(MODULE_STORAGE_KEY, JSON.stringify(next)); } catch { /* private mode */ }
      return next;
    });
  }

  /** Part 104 / productSnapshot semantics: business scenarios open from A2. */
  const levelIdx = data ? levelIndex(data.level) : null;
  const gated = levelIdx !== null && levelIdx < 2;

  const trackPreview = useMemo(() => {
    const chosen = PROFESSIONAL_LIBRARY.filter((d) => TRACK_PREVIEW_IDS.includes(d.id));
    return { chosen, total: PROFESSIONAL_LIBRARY.length };
  }, []);
  const professionalLessonCount = PROFESSIONAL_CURRICULUM.length;

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Products · Business English"
        title="Business English"
        purpose="Train for the meeting, the email, the interview — the actual thing."
        action={gated ? "Keep building on General English" : "Practise your actual thing"}
        actionHref={gated ? "/general-english" : "/business-english/actual-thing"}
      />

      {/* Level gate — warm, honest, with a way forward (Part 104 / productSnapshot semantics). */}
      {gated && (
        <section className="panel biz-gate" aria-live="polite" aria-label="Level gate">
          <p className="eyebrow">Almost there</p>
          <h2>Business scenarios open from A2</h2>
          <p className="subtle">
            Your General English work is building toward it. Every lesson you finish now counts twice — the core
            journey is the same road that leads here.
          </p>
          <div className="biz-gate-actions">
            <Link className="button" href="/general-english">Continue General English</Link>
            <Link className="button secondary" href="/diagnostic">Check my level</Link>
          </div>
        </section>
      )}

      {!gated && (
        <>
          {/* Outcome model — the heart of the product (Part 55). */}
          <section className="panel" aria-label="Real work outcomes">
            <div className="panel-title">
              <h3>Pick the outcome, not the topic</h3>
              <span>Real deliverables, practised end to end</span>
            </div>
            <div className="biz-outcome-grid">
              {OUTCOMES.map((o) => (
                <article key={o.title} className="biz-outcome">
                  <h4>{o.title}</h4>
                  <p className="biz-outcome-scenario">{o.scenario}</p>
                  <p className="biz-outcome-good"><span>What good looks like</span>{o.good}</p>
                  <Link className="link-button" href={o.href}>{o.cta} &rarr;</Link>
                </article>
              ))}
            </div>
          </section>

          {/* Practise Your Actual Thing — the premium differentiator (Part 56/86). */}
          <section className="panel biz-promo" aria-label="Practise your actual thing">
            <div>
              <p className="eyebrow">Personalised · Premium</p>
              <h2>Practise Your Actual Thing</h2>
              <p className="subtle">
                Paste a real job description and get the language demands, the likely questions and a practice plan.
                Paste a real email and get it rewritten, with every change explained. Nothing generic — your actual thing.
              </p>
            </div>
            <Link className="button" href="/business-english/actual-thing">Start with your real material</Link>
          </section>
        </>
      )}

      {/* Module progression — checkable, stored locally, every module starts somewhere real. */}
      <section className="panel" aria-label="Module progression">
        <div className="panel-title">
          <h3>The module path</h3>
          <span>{doneModules.length} of {MODULES.length} marked done</span>
        </div>
        <ol className="biz-modules">
          {MODULES.map((mod, i) => {
            const done = doneModules.includes(mod.id);
            return (
              <li key={mod.id} className="biz-module" data-done={done ? "true" : undefined}>
                <label className="biz-module-check">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleModule(mod.id)}
                    aria-label={`Mark ${mod.title} as done`}
                  />
                  <span className="biz-module-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                </label>
                <div className="biz-module-body">
                  <strong>{mod.title}</strong>
                  <span>{mod.blurb}</span>
                  <div className="biz-module-actions">
                    <Link className="button secondary" href={mod.surfaces[0].href}>
                      {done ? "Practise again" : "Start"} · {mod.surfaces[0].label}
                    </Link>
                    {mod.surfaces[1] && (
                      <Link className="link-button" href={mod.surfaces[1].href}>Also: {mod.surfaces[1].label}</Link>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="subtle" style={{ margin: "12px 0 0" }}>
          Ticking a module is your own marker, kept in this browser — the platform never pretends you finished
          something you have not practised.
        </p>
      </section>

      {/* Industry tracks — architecture visibility only (Part 57). */}
      <section className="panel" aria-label="Industry tracks coming">
        <div className="panel-title">
          <h3>Industry tracks (coming)</h3>
          <span>{trackPreview.total} domains mapped in the professional library</span>
        </div>
        <p className="subtle" style={{ margin: "0 0 14px" }}>
          The architecture is already in place: domain &rarr; track &rarr; teachable units with real terminology and
          authentic tasks. Tracks open level by level — nothing here claims to be live yet.
        </p>
        <div className="biz-tracks">
          {trackPreview.chosen.map((domain) => (
            <div key={domain.id} className="biz-track" aria-label={`${domain.label} — coming`}>
              <strong>{domain.label}</strong>
              <span>{domain.blurb}</span>
              <em>Coming</em>
            </div>
          ))}
        </div>
        <p className="subtle" style={{ margin: "12px 0 0" }}>
          Plus {Math.max(0, trackPreview.total - trackPreview.chosen.length)} further domains — from Legal to
          Oil &amp; Gas — mapped and waiting in the library. In the meantime the Professional curriculum
          ({PROFESSIONAL_LEVELS.join(" → ")}, {professionalLessonCount} lessons) is already live in{" "}
          <Link href="/learning-path">My Journey</Link>.
        </p>
      </section>

      {!data && !authed && (
        <section className="panel" aria-label="Sign in note">
          <p className="subtle" style={{ margin: 0 }}>
            Sign in and this page reads your level from the platform — the gate, the modules and the outcomes all
            follow it.
          </p>
        </section>
      )}
    </main>
  );
}
