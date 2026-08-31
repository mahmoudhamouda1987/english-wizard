"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@/app/lib/track";
import { PRODUCT_NAMES } from "@/src/domain/entitlements";
import { annualSavingPct, formatPrice, pricesForRegion, type PriceEntry, type RegionCode } from "@/src/domain/pricing";

interface Access {
  premium: boolean;
  trialStatus: string;
  inTrial: boolean;
  trialExpired: boolean;
  paidTier: string;
  trial: { active: boolean; daysLeft: number; hoursLeft: number; totalHours: number; fractionRemaining: number; endsAt?: string };
}

interface SubscriptionState {
  subscription: { tier: string; status: string; periodEnd?: string; cancelAtPeriodEnd: boolean } | null;
  effectiveTier: string;
}

const ORDER: PriceEntry["product"][] = ["general-english", "business-english", "fluency-track", "ielts", "cambridge", "all-access"];

export default function PlanPage() {
  const router = useRouter();
  const [access, setAccess] = useState<Access | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [changing, setChanging] = useState<string | null>(null);
  const [region, setRegion] = useState<RegionCode>("WW");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    track("plan_page_viewed");
    Promise.all([
      fetch("/api/access", { cache: "no-store" }).then(async (r) => { const p = await r.json(); if (!r.ok) throw new Error(p.error); return p as Access; }),
      fetch("/api/subscription", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([a, s]) => { setAccess(a); setSubscription(s); })
      .catch((e) => { if (String(e?.message ?? "").toLowerCase().includes("auth")) router.push("/auth"); else setError(String(e?.message ?? "Unable to load plan.")); });
  }, [router]);

  async function postSubscription(body: Record<string, unknown>, okMessage?: string) {
    setChanging(String(body.action ?? ""));
    try {
      const r = await fetch("/api/subscription", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const p = await r.json();
      if (!r.ok) throw new Error(p.error ?? "Unable to update your plan.");
      if (body.action === "CHANGE_PLAN") {
        const tier = String(body.tier);
        localStorage.setItem("plan", tier);
        // A paid plan converts the trial so it stops counting down.
        await fetch("/api/trial", { method: "PUT" }).catch(() => {});
        if (tier !== "FREE") track("subscription_started", { tier });
        setAccess((a) => (a ? { ...a, premium: tier !== "FREE", paidTier: tier, trialStatus: tier === "FREE" ? a.trialStatus : "CONVERTED", trialExpired: false } : a));
      }
      if (p.subscription) setSubscription({ subscription: p.subscription, effectiveTier: p.effectiveTier });
      if (okMessage) setError(okMessage);
      setChanging(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update your plan.");
      setChanging(null);
    }
  }

  async function startTrial() {
    setChanging("TRIAL");
    try {
      const r = await fetch("/api/trial", { method: "POST" });
      if (!r.ok) throw new Error("Unable to start your trial.");
      const a = await (await fetch("/api/access", { cache: "no-store" })).json();
      setAccess(a as Access);
      setChanging(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to start your trial.");
      setChanging(null);
    }
  }

  if (error && !access) return <main id="main-content" style={{ maxWidth: 720, margin: "80px auto", padding: 24 }}><p role="alert" className="state-card error">{error}</p></main>;
  if (!access) return <main id="main-content" style={{ maxWidth: 720, margin: "80px auto", padding: 24 }}><div className="state-card">Loading your plan…</div></main>;

  const trial = access.trial;
  const plans = pricesForRegion(region);
  const active = access.paidTier ?? "FREE";
  const sub = subscription?.subscription ?? null;
  const managing = sub && sub.status !== "CANCELLED";

  return (
    <main id="main-content" style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Trial-expired presentation (Part 23): premium continuation headline */}
      {access.trialExpired && (
        <section style={{ marginBottom: 26, textAlign: "center", padding: "34px 24px", borderRadius: 20, background: "linear-gradient(135deg,#0f1535,#2a1a4a)", color: "white" }}>
          <p className="eyebrow" style={{ color: "#a5b4fc" }}>English Wizard · Your journey continues</p>
          <h1 style={{ fontSize: "clamp(28px,4.5vw,40px)", margin: "6px 0 10px", fontWeight: 900 }}>Continue Your English Journey</h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, opacity: .88, maxWidth: 560, margin: "0 auto" }}>
            Your LevelCheck discovered where you are. Now continue building the skills that take you where you want to go.
          </p>
        </section>
      )}
      <p className="eyebrow">English Wizard · Your plan</p>
      <h1 style={{ fontSize: "clamp(28px,4vw,40px)", margin: "4px 0 6px" }}>Continue your learning journey</h1>
      <p className="subtle" style={{ margin: "0 0 24px" }}>One price per product. One subscription for everything.</p>

      {error && access && <p role="status" className="state-card" style={{ marginBottom: 18 }}>{error}</p>}

      {/* Trial status card */}
      <section className="panel tint-accent" style={{ padding: 24, marginBottom: 24 }}>
        {access.inTrial ? (
          <TrialActive trial={trial} />
        ) : access.trialExpired ? (
          <TrialExpired />
        ) : access.premium ? (
          <PremiumActive tier={active} cancelAtPeriodEnd={Boolean(sub?.cancelAtPeriodEnd)} />
        ) : (
          <NoTrial onStart={() => { void startTrial(); }} busy={changing === "TRIAL"} />
        )}
      </section>

      {/* Manage an active subscription */}
      {managing && (
        <section className="panel" style={{ padding: 22, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>Manage your subscription</h2>
          <p className="subtle" style={{ margin: "0 0 14px", fontSize: 13.5 }}>
            {PRODUCT_NAMES[sub.tier as keyof typeof PRODUCT_NAMES] ?? sub.tier} · {sub.status === "PAUSED" ? "paused" : sub.cancelAtPeriodEnd ? "cancels at period end" : "active"}
            {sub.periodEnd ? ` · renews ${new Date(sub.periodEnd).toLocaleDateString()}` : ""} — your learning data is never affected by a plan change.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {sub.cancelAtPeriodEnd || sub.status === "PAUSED" ? (
              <button className="button" disabled={changing !== null} onClick={() => void postSubscription({ action: "RESUME" })}>
                {changing === "RESUME" ? "Updating…" : "Resume subscription"}
              </button>
            ) : (
              <>
                <button className="button secondary" disabled={changing !== null} onClick={() => void postSubscription({ action: "PAUSE" })}>
                  {changing === "PAUSE" ? "Updating…" : "Pause"}
                </button>
                <button className="button secondary" disabled={changing !== null} onClick={() => void postSubscription({ action: "CANCEL" })}>
                  {changing === "CANCEL" ? "Updating…" : "Cancel at period end"}
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* Region + period controls (mirrors /pricing) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
        <div role="group" aria-label="Region" style={{ display: "inline-flex", gap: 8 }}>
          {(["WW", "EG"] as RegionCode[]).map((code) => (
            <button key={code} type="button" aria-pressed={region === code} onClick={() => setRegion(code)}
              className={region === code ? "button" : "button secondary"} style={{ padding: "7px 14px", fontSize: 13 }}>
              {code === "WW" ? "Worldwide (USD)" : "Egypt (EGP)"}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Billing period" style={{ display: "inline-flex", gap: 8 }}>
          {(["monthly", "yearly"] as const).map((p) => (
            <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)}
              className={period === p ? "button" : "button secondary"} style={{ padding: "7px 14px", fontSize: 13, textTransform: "capitalize" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Plan selection from the 2.0 catalogue (Parts 77-79) */}
      <h2 style={{ fontSize: 22, margin: "0 0 16px", textAlign: "center" }}>Choose your path</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {plans
          .slice()
          .sort((a, b) => ORDER.indexOf(a.product) - ORDER.indexOf(b.product))
          .map((p) => {
            const isCurrent = active === p.product;
            const yearly = period === "yearly";
            const pct = annualSavingPct(p);
            return (
              <section key={p.product} className="panel" style={{ margin: 0, padding: 22, position: "relative", border: isCurrent ? "2px solid var(--accent-primary)" : undefined }}>
                {p.product === "all-access" && <span className="streak-pill" style={{ position: "absolute", top: -14, left: 22 }}>Best value</span>}
                <h3 style={{ fontSize: 18, margin: "0 0 4px" }}>{p.name}</h3>
                <p className="subtle" style={{ fontSize: 13, margin: "0 0 8px", minHeight: 36 }}>{p.positioning}</p>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--accent-text)", margin: "6px 0" }}>
                  {formatPrice(yearly ? p.annual : p.monthly, p.currency)}
                  <small className="subtle" style={{ fontSize: 13 }}> / {yearly ? "year" : "month"}</small>
                </div>
                <p className="subtle" style={{ fontSize: 12.5, margin: "0 0 10px" }}>
                  {yearly ? `You save ${formatPrice(p.annualSaving, p.currency)} a year (${pct}% off monthly).` : `Or ${formatPrice(p.annual, p.currency)}/year — save ${pct}%.`}
                </p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 5, fontSize: 13, lineHeight: 1.5 }}>
                  {p.entitlements.features.map((f) => <li key={f}>✓ {f}</li>)}
                </ul>
                <button
                  onClick={() => void postSubscription({ action: "CHANGE_PLAN", tier: p.product })}
                  disabled={changing !== null || isCurrent}
                  className={isCurrent ? "button secondary" : "button"}
                  style={{ width: "100%", textAlign: "center", marginTop: 12 }}
                >
                  {changing === p.product ? "Updating…" : isCurrent ? "Current plan ✓" : "Start 7-day trial"}
                </button>
              </section>
            );
          })}
      </div>

      {/* Included with every account (the free base state — never a "forever" sales card) */}
      <section className="panel tint-accent" style={{ padding: 22, marginTop: 24 }}>
        <h2 style={{ fontSize: 18, margin: "0 0 6px" }}>Included with every account</h2>
        <p className="subtle" style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7 }}>
          LevelCheck placement, your personalised learning path, the core curriculum with spaced review, daily plan and progress
          insights, 5 AI teacher sessions and 2 speaking coach checks every day. Your placement report, Student ID and progress are
          always preserved — a plan change never touches your learning data.
        </p>
      </section>

      {/* Feature comparison (Part 23) — Free vs any single product vs All Access */}
      <h2 style={{ fontSize: 20, margin: "28px 0 12px" }}>What each plan unlocks</h2>
      <section className="panel" style={{ padding: 0, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 560 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid var(--border-default)" }}>
              <th style={{ padding: "12px 16px" }}>Feature</th>
              <th style={{ padding: "12px 16px" }}>Included free</th>
              <th style={{ padding: "12px 16px" }}>Any product</th>
              <th style={{ padding: "12px 16px" }}>All Access</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Personalised dashboard + placement report", "✓", "✓", "✓"],
              ["Core curriculum + review system", "✓", "✓", "✓"],
              ["AI teacher sessions / day", "5", "30", "Unlimited"],
              ["Speaking coach checks / day", "2", "10", "Unlimited"],
              ["Exam pathways (IELTS · Cambridge)", "—", "IELTS · Cambridge · All Access", "✓"],
              ["Deep Study sessions", "—", "3 / day", "Unlimited"],
              ["Boss Missions", "—", "1 / day", "Unlimited"],
              ["All five products, one subscription", "—", "—", "✓"],
            ].map((row) => (
              <tr key={row[0]} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                {row.map((cell, ci) => <td key={ci} style={{ padding: "11px 16px", fontWeight: ci === 0 ? 600 : 400, color: cell === "—" ? "var(--text-tertiary)" : undefined }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

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
          <p className="subtle" style={{ margin: "2px 0 0" }}>Every product is open — the complete English Wizard ecosystem. {trial.endsAt ? `${new Date(trial.endsAt).toLocaleDateString()} ` : ""}· No card required.</p>
        </div>
        <span className="streak-pill" style={{ marginLeft: "auto", fontSize: 14 }}>{days} day{days === 1 ? "" : "s"} left</span>
      </div>
      <div style={{ position: "relative", height: 14, background: "var(--accent-softer)", borderRadius: 8, marginTop: 18, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(100, Math.max(0, fraction * 100))}%`, height: "100%", background: "linear-gradient(90deg,#6840d6,#8b5cf6)", borderRadius: 8 }} />
      </div>
      <p className="subtle" style={{ fontSize: 12.5, margin: "10px 0 0" }}>When your trial ends, premium features pause automatically — your progress and data are always kept.</p>
    </>
  );
}

function TrialExpired() {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 28 }}>⏳</span>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h2 style={{ fontSize: 20, margin: 0 }}>Your 7-day trial has ended</h2>
          <p className="subtle" style={{ margin: "2px 0 0" }}>Premium features are now paused. There&rsquo;s nothing to lose — your placement report, Student ID and progress are all preserved.</p>
        </div>
      </div>
      <p className="subtle" style={{ fontSize: 12.5, margin: "12px 0 0" }}>You can still log in, view your report and profile, and explore plans below.</p>
    </>
  );
}

function PremiumActive({ tier, cancelAtPeriodEnd }: { tier: string; cancelAtPeriodEnd: boolean }) {
  const name = PRODUCT_NAMES[tier as keyof typeof PRODUCT_NAMES] ?? tier;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 28 }}>⭐</span>
      <div>
        <h2 style={{ fontSize: 20, margin: 0 }}>{name} is active</h2>
        <p className="subtle" style={{ margin: "2px 0 0" }}>
          {cancelAtPeriodEnd ? "Your subscription cancels at period end — everything stays open until then. " : "Everything in your plan is unlocked — thanks for supporting English Wizard. "}
          Your progress is always kept.
        </p>
      </div>
    </div>
  );
}

function NoTrial({ onStart, busy }: { onStart: () => void; busy: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontSize: 28 }}>🎁</span>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>Start your free 7-day trial</h2>
        <p className="subtle" style={{ margin: "2px 0 0" }}>Every product open for 7 days — no card needed to start.</p>
      </div>
      <button onClick={onStart} disabled={busy} className="button">{busy ? "Starting…" : "Start trial →"}</button>
    </div>
  );
}
