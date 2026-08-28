"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Access {
  premium: boolean;
  trialStatus: string;
  inTrial: boolean;
  trialExpired: boolean;
  paidTier: string;
  trial: { active: boolean; daysLeft: number; hoursLeft: number; totalHours: number; fractionRemaining: number; endsAt?: string };
  subscription?: { tier: string; status: string; periodEnd?: string } | null;
}

const PLANS = [
  { tier: "FREE", name: "Free", price: "$0", tag: "forever", desc: "Daily mission, core lessons, review and Voice Time Machine — unlimited.", cta: "Stay free" },
  { tier: "PLUS", name: "Plus", price: "$9", tag: "/month", desc: "Exam pathways, deep study, boss missions, 30 AI sessions and 10 speaking checks daily.", cta: "Start Plus" },
  { tier: "PRO", name: "Pro", price: "$19", tag: "/month", desc: "Everything unlimited — AI teacher, speaking coach, all pathways and priority access.", cta: "Go Pro" },
];

export default function PlanPage() {
  const router = useRouter();
  const [access, setAccess] = useState<Access | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changing, setChanging] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/access", { cache: "no-store" })
      .then(async (r) => { const p = await r.json(); if (!r.ok) throw new Error(p.error); setAccess(p as Access); })
      .catch((e) => { if (String(e?.message ?? "").toLowerCase().includes("auth")) router.push("/auth"); else setError(String(e?.message ?? "Unable to load plan.")); });
  }, [router]);

  async function choose(tier: string) {
    setChanging(tier);
    try {
      const r = await fetch("/api/subscription", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "CHANGE_PLAN", tier }),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error ?? "Unable to update plan.");
      localStorage.setItem("plan", tier);
      // A paid plan converts the trial so it stops counting down.
      await fetch("/api/trial", { method: "PUT" }).catch(() => {});
      setAccess((a) => (a ? { ...a, premium: tier !== "FREE", paidTier: tier, trialStatus: tier === "FREE" ? a.trialStatus : "CONVERTED", trialExpired: false } : a));
      setChanging(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update plan.");
      setChanging(null);
    }
  }

  if (error) return <main id="main-content" style={{ maxWidth: 720, margin: "80px auto", padding: 24 }}><p role="alert" className="state-card error">{error}</p></main>;
  if (!access) return <main id="main-content" style={{ maxWidth: 720, margin: "80px auto", padding: 24 }}><div className="state-card">Loading your plan…</div></main>;

  const trial = access.trial;

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>
      <p className="eyebrow">Your plan</p>
      <h1 style={{ fontSize: "clamp(28px,4vw,40px)", margin: "4px 0 6px" }}>Subscription &amp; trial</h1>
      <p className="subtle" style={{ margin: "0 0 24px" }}>Manage access to English Wizard&rsquo;s premium practice features.</p>

      {/* Trial status card */}
      <section className="panel" style={{ padding: 24, marginBottom: 24, background: "linear-gradient(135deg,#f6f2ff,#f0f4ff)" }}>
        {access.inTrial ? (
          <TrialActive trial={trial} />
        ) : access.trialExpired ? (
          <TrialExpired />
        ) : access.premium ? (
          <PremiumActive tier={access.paidTier} />
        ) : (
          <NoTrial onStart={() => { void choose("PLUS"); }} />
        )}
      </section>

      {/* Plan selection */}
      <h2 style={{ fontSize: 24, margin: "0 0 16px" }}>Choose a plan</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {PLANS.map((p) => {
          const active = (access.paidTier ?? "FREE") === p.tier;
          return (
            <section key={p.tier} className="panel" style={{ margin: 0, padding: 22, border: active ? "2px solid #6840d6" : undefined }}>
              <h3 style={{ fontSize: 18, margin: "0 0 4px" }}>{p.name}</h3>
              <div style={{ fontSize: 34, fontWeight: 800, color: "#4626b8", margin: "6px 0" }}>{p.price}<small className="subtle" style={{ fontSize: 13 }}> {p.tag}</small></div>
              <p className="subtle" style={{ fontSize: 13.5, lineHeight: 1.6, minHeight: 64 }}>{p.desc}</p>
              <button onClick={() => void choose(p.tier)} disabled={changing !== null || active} className={active ? "button secondary" : "button"} style={{ width: "100%", textAlign: "center" }}>
                {changing === p.tier ? "Updating…" : active ? "Current plan ✓" : p.cta}
              </button>
            </section>
          );
        })}
      </div>

      <p className="subtle" style={{ marginTop: 18, fontSize: 12.5 }}>Plan changes in this environment are recorded directly for you. In production a payment provider attaches its own reference — your learning data is never affected by a plan change.</p>
      <Link href="/dashboard" style={{ display: "inline-block", marginTop: 8 }}>← Back to dashboard</Link>
    </main>
  );
}

function TrialActive({ trial }: { trial: Access["trial"] }) {
  const fraction = trial.fractionRemaining ?? 0;
  const days = Math.max(trial.daysLeft, 0);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>🎁</span>
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>7-day guided trial active</h2>
          <p className="subtle" style={{ margin: "2px 0 0" }}>Enjoy every premium feature free. {trial.endsAt ? `${new Date(trial.endsAt).toLocaleDateString()} ` : ""}· No card required.</p>
        </div>
        <span className="streak-pill" style={{ marginLeft: "auto", fontSize: 14 }}>{days} day{days === 1 ? "" : "s"} left</span>
      </div>
      <div style={{ position: "relative", height: 14, background: "#e6e0ff", borderRadius: 8, marginTop: 18, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, fraction * 100))}%`, height: "100%", background: "linear-gradient(90deg,#6840d6,#8b5cf6)", borderRadius: 8 }} />
      </div>
      <p className="subtle" style={{ fontSize: 12.5, margin: "10px 0 0" }}>When your trial ends, premium features pause automatically — your progress and data are always kept.</p>
    </>
  );
}

function TrialExpired() {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>⏳</span>
        <div>
          <h2 style={{ fontSize: 20, margin: 0 }}>Your 7-day trial has ended</h2>
          <p className="subtle" style={{ margin: "2px 0 0" }}>Premium features are now paused. There&rsquo;s nothing to lose — your progress and report are safe.</p>
        </div>
      </div>
    </>
  );
}

function PremiumActive({ tier }: { tier: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 28 }}>⭐</span>
      <div>
        <h2 style={{ fontSize: 20, margin: 0 }}>You&rsquo;re on {tier}</h2>
        <p className="subtle" style={{ margin: "2px 0 0" }}>All {tier === "PRO" ? "unlimited" : "premium"} features are unlocked — thanks for supporting English Wizard.</p>
      </div>
    </div>
  );
}

function NoTrial({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 28 }}>🎁</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>Start your free 7-day trial</h2>
        <p className="subtle" style={{ margin: "2px 0 0" }}>Unlock every premium feature free for 7 days.</p>
      </div>
      <button onClick={onStart} className="button">Start trial →</button>
    </div>
  );
}
