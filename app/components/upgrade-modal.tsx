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
  maxWidth: 460, width: "100%", background: "white", borderRadius: 18, padding: "28px 26px",
  boxShadow: "0 24px 60px rgba(15,21,53,.35)", position: "relative", animation: "upModal .25s ease",
};

export type GateFeature = "EXAM_PATHWAY" | "DEEP_STUDY" | "BOSS_MISSION" | "SPEAKING_COACH";

const FEATURE_COPY: Record<GateFeature, { icon: string; eyebrow: string; title: string; body: string }> = {
  EXAM_PATHWAY: {
    icon: "🎓",
    eyebrow: "Premium pathway",
    title: "Exam pathways are part of Plus",
    body: "IELTS and Cambridge pathways with real exam-format questions are included with Plus. Start your 7-day trial free and keep the report you've already earned.",
  },
  DEEP_STUDY: {
    icon: "🧠",
    eyebrow: "Deep study",
    title: "Go deeper with Deep Study",
    body: "Longer, focused English sessions that push you further are part of Plus. Try them free for 7 days — no card required.",
  },
  BOSS_MISSION: {
    icon: "🏆",
    eyebrow: "Boss mission",
    title: "Boss Missions are a Plus feature",
    body: "Hard challenges that stretch your skills live on the Plus plan. Begin your free 7-day trial to unlock them now.",
  },
  SPEAKING_COACH: {
    icon: "🎙️",
    eyebrow: "Speaking coach",
    title: "More speaking practice with Plus or Pro",
    body: "You've used your daily free speaking checks. Upgrade for 10–unlimited sessions per day, or just enjoy your trial now.",
  },
};

export function UpgradeModal({ open, onClose, feature = "EXAM_PATHWAY" }: { open: boolean; onClose: () => void; feature?: GateFeature }) {
  const router = useRouter();
  const info = FEATURE_COPY[feature];
  const [starting, setStarting] = useState(false);
  const [trialDays, setTrialDays] = useState(7);
  const [trialActive, setTrialActive] = useState(false);

  useEffect(() => {
    if (!open) return;
    track("upgrade_modal_opened", { feature });
    fetch("/api/access", { cache: "no-store" })
      .then((r) => r.json())
      .then((a: AccessInfo) => {
        setTrialActive(Boolean(a.inTrial));
        setTrialDays(Math.max(a.trial.active ? a.trial.daysLeft : 7, 1));
      })
      .catch(() => { /* use defaults */ });
  }, [open, feature]);

  if (!open) return null;

  async function goToPlan() {
    setStarting(true);
    track("upgrade_clicked", { feature });
    try {
      await fetch("/api/trial", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
      // Opening the plan page lets the learner choose Plus / Pro (or continue free).
      router.push("/pricing?from=upgrade");
    } catch {
      router.push("/pricing?from=upgrade");
    }
  }

  return (
    <div style={OVERLAY} role="dialog" aria-modal="true" aria-labelledby="upgrade-title" onClick={onClose}>
      <div style={MODAL} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 14, right: 16, border: 0, background: "transparent", fontSize: 22, cursor: "pointer", color: "#5b6272" }}>✕</button>
        <div style={{ fontSize: 44 }}>{info.icon}</div>
        <p className="eyebrow" style={{ margin: "8px 0 2px", color: "#6840d6" }}>{info.eyebrow}</p>
        <h2 id="upgrade-title" style={{ margin: "0 0 8px", fontSize: 22 }}>{info.title}</h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, opacity: .9, margin: "0 0 18px" }}>{info.body}</p>
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          <button onClick={goToPlan} disabled={starting} className="button" style={{ width: "100%", textAlign: "center", padding: "14px" }}>
            {trialActive ? `Continue my ${trialDays}-day trial →` : "Start my free 7-day trial →"}
          </button>
          <button onClick={onClose} className="button secondary" style={{ width: "100%", textAlign: "center", padding: "12px" }}>
            Not now — keep learning free
          </button>
        </div>
        <p className="subtle" style={{ fontSize: 12, textAlign: "center", margin: 0 }}>Core lessons and review stay free forever. No credit card needed for the trial.</p>
        <style>{`@keyframes upModal{from{opacity:0;transform:translateY(12px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
      </div>
    </div>
  );
}
