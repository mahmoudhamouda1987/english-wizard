"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/app/lib/track";

interface AccessInfo {
  premium: boolean;
  trialStatus: string;
  inTrial: boolean;
  trialExpired: boolean;
  paidTier: string;
  trial: { active: boolean; daysLeft: number; hoursLeft: number; fractionRemaining: number; endsAt?: string };
}

const OVERLAY: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(15,21,53,.5)", display: "flex",
  alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20, backdropFilter: "blur(2px)",
};
const MODAL: React.CSSProperties = {
  maxWidth: 500, width: "100%", background: "white", borderRadius: 18, padding: "28px 26px",
  boxShadow: "0 24px 60px rgba(15,21,53,.35)", position: "relative", animation: "upModal .25s ease",
  maxHeight: "90vh", overflowY: "auto",
};

export type GateFeature = "EXAM_PATHWAY" | "DEEP_STUDY" | "BOSS_MISSION" | "SPEAKING_COACH";

/**
 * Locked-feature experience (Part 20) — never a bare "Subscribe": the modal
 * explains what the feature does, why it matters, what the learner has already
 * unlocked, and the additional value a plan adds. CTAs: View Plans /
 * Continue Exploring. No aggressive dark patterns.
 */
const FEATURE_COPY: Record<GateFeature, { icon: string; eyebrow: string; what: string; why: string; value: string }> = {
  EXAM_PATHWAY: {
    icon: "🎓",
    eyebrow: "Exam pathways",
    what: "Full IELTS and Cambridge pathways with real exam-format questions, timed practice and band-accurate scoring.",
    why: "If you're aiming at an official exam goal, pathway practice is the bridge between your current level and your target band.",
    value: "Included with IELTS, Cambridge or All Access — every product is open during your 7-day trial.",
  },
  DEEP_STUDY: {
    icon: "🧠",
    eyebrow: "Deep study",
    what: "Longer, focused sessions that go beyond the daily loop — sustained reading, listening and production blocks.",
    why: "Depth is how intermediate learners break through plateaus: more context, more challenge, faster growth.",
    value: "3 deep sessions daily with any product subscription — unlimited with All Access.",
  },
  BOSS_MISSION: {
    icon: "🏆",
    eyebrow: "Boss missions",
    what: "Hard challenge missions that stretch every skill at once and prove what you can do under pressure.",
    why: "Mastery needs stretch. Boss missions are the premium version of 'a little beyond comfortable'.",
    value: "A daily boss challenge with any product subscription — unlimited with All Access.",
  },
  SPEAKING_COACH: {
    icon: "🎙️",
    eyebrow: "Speaking coach",
    what: "Extra guided speaking checks with structured feedback on fluency, range and delivery.",
    why: "Speaking improves with frequent, low-stakes practice — the coach keeps those reps coming.",
    value: "10 guided checks daily with any product subscription — unlimited with All Access.",
  },
};

const ALREADY_UNLOCKED = [
  "Personalized dashboard + placement report",
  "Full core curriculum + review system",
  "Daily AI study help",
];

export function UpgradeModal({ open, onClose, feature = "EXAM_PATHWAY" }: { open: boolean; onClose: () => void; feature?: GateFeature }) {
  const router = useRouter();
  const info = FEATURE_COPY[feature];
  const [starting, setStarting] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const [trialActive, setTrialActive] = useState(false);

  useEffect(() => {
    if (!open) return;
    track("upgrade_modal_opened", { feature });
    track("premium_feature_viewed", { feature });
    fetch("/api/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((a: AccessInfo) => {
        setTrialActive(Boolean(a.inTrial));
        setTrialDays(Math.max(a.trial.active ? a.trial.daysLeft : 7, 1));
      })
      .catch(() => { /* use defaults */ });
  }, [open, feature]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function goToPlan() {
    setStarting(true);
    track("upgrade_clicked", { feature });
    try {
      await fetch("/api/trial", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
      router.push("/pricing?from=upgrade");
    } catch {
      router.push("/pricing?from=upgrade");
    }
  }

  return (
    <div style={OVERLAY} role="dialog" aria-modal="true" aria-labelledby="upgrade-title" onClick={onClose}>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 16, border: 0, background: "transparent", fontSize: 22, cursor: "pointer", color: "var(--text-secondary)" }}>✕</button>
        <div style={{ fontSize: 42 }}>{info.icon}</div>
        <p className="eyebrow" style={{ margin: "8px 0 2px", color: "var(--accent-primary)" }}>{info.eyebrow}</p>
        <h2 id="upgrade-title" style={{ margin: "0 0 4px", fontSize: 22 }}>Unlock Your Full English Journey</h2>
        <p className="subtle" style={{ fontSize: 13, margin: "0 0 14px" }}>This feature is included with your English Wizard subscription.</p>

        <div style={{ display: "grid", gap: 10, fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
          <p style={{ margin: 0 }}><strong>What it does:</strong> {info.what}</p>
          <p style={{ margin: 0 }}><strong>Why it matters:</strong> {info.why}</p>
        </div>

        <div style={{ background: "#f6f4ff", borderRadius: 12, padding: "12px 14px", marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>✓ Already unlocked for you</div>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, color: "#3c3557" }}>
            {ALREADY_UNLOCKED.map((item) => <li key={item}>{item}</li>)}
          </ul>
          <div style={{ fontWeight: 700, margin: "10px 0 2px" }}>⭐ A subscription unlocks</div>
          <div style={{ color: "#3c3557" }}>{info.value}</div>
        </div>

        <div style={{ display: "grid", gap: 10, marginBottom: 8 }}>
          <button onClick={goToPlan} disabled={starting} className="button" style={{ width: "100%", textAlign: "center", padding: "14px" }}>
            {trialActive ? `View Plans — ${trialDays} trial day${trialDays === 1 ? "" : "s"} left →` : "View Plans →"}
          </button>
          <button onClick={onClose} className="button secondary" style={{ width: "100%", textAlign: "center", padding: "12px" }}>
            Continue Exploring
          </button>
        </div>
        <p className="subtle" style={{ fontSize: 12, textAlign: "center", margin: 0 }}>Core lessons and review stay included with every account. No credit card needed for the trial.</p>
        <style>{`@keyframes upModal{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      </div>
    </div>
  );
}
