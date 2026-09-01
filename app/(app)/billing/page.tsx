"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { productMeta, ALL_ACCESS_META } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import { PRODUCT_NAMES, type PlanTier } from "@/src/domain/entitlements";
import { formatPrice, pricesForRegion, type RegionCode } from "@/src/domain/pricing";
import { track } from "@/app/lib/track";

interface Sub {
  tier: PlanTier;
  status: string;
  provider: string;
  externalReference: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubResponse {
  subscription: Sub | null;
  effectiveTier: PlanTier;
  inGrace?: boolean;
  graceMessage?: string;
}

/**
 * BILLING & SUBSCRIPTION (spec §29) — the commercial state in the open:
 * current subscription, the active path it covers, payment method, billing
 * dates, cancel/reactivate, and the regional price reference. Honest about
 * what the current provider does and does not support.
 */
export default function BillingPage() {
  const [data, setData] = useState<SubResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [region] = useState<RegionCode>("WW");

  const load = useCallback(() => {
    fetch("/api/subscription", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setData(d); })
      .catch(() => { /* cards stay neutral */ });
  }, []);

  useEffect(() => {
    track("billing_page_opened");
    load();
  }, [load]);

  async function act(action: "CANCEL" | "RESUME" | "PAUSE") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "That action could not be completed.");
      setMessage(action === "CANCEL" ? "Your subscription will end at the close of the current period — nothing is deleted." : "Subscription updated.");
      load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "That action could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  const sub = data?.subscription ?? null;
  const tier = data?.effectiveTier ?? "FREE";
  const isFree = tier === "FREE" || !sub || sub.status === "CANCELLED";
  const meta = tier === "all-access" ? ALL_ACCESS_META : productMeta(tier);
  const IconKey = tier === "all-access" ? "certificate" : meta && "icon" in meta ? meta.icon : "globe";
  const Icon = PRODUCT_ICON_COMPONENTS[IconKey as keyof typeof PRODUCT_ICON_COMPONENTS] ?? PRODUCT_ICON_COMPONENTS.globe;
  const displayName = PRODUCT_NAMES[tier] ?? tier;

  const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "—");

  return (
    <main id="main-content" className="dash-main page-stack">
      <header className="lp-head">
        <span className="lp-eyebrow">Account</span>
        <h1>Billing &amp; Subscription</h1>
        <p className="subtle">Your plan, your dates, your control — everything about your membership in the open.</p>
      </header>

      {data?.inGrace && data.graceMessage && (
        <p className="lp-audit-note" role="status"><span className="dot" aria-hidden="true" /> {data.graceMessage}</p>
      )}

      <div className="billing-grid">
        <section className="billing-card" aria-label="Current subscription">
          <h3>Current subscription</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="lp-icon" style={{ background: (tier === "all-access" ? ALL_ACCESS_META : productMeta(tier))?.gradient, width: 42, height: 42, borderRadius: 12 }} aria-hidden="true"><Icon size={20} /></span>
            <div>
              <div className="bc-value">{displayName}</div>
              <div className="bc-sub">
                {isFree
                  ? "No active subscription — the core curriculum stays included."
                  : sub?.status === "TRIALING"
                    ? "7-day trial in progress"
                    : sub?.cancelAtPeriodEnd
                      ? "Ends at the close of the current period"
                      : "Active subscription"}
              </div>
            </div>
          </div>
          {message && <p className="bc-sub" role="status" style={{ color: "var(--success)", fontWeight: 700 }}>{message}</p>}
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginTop: 4 }}>
            <Link className="lp-cta primary" href="/plan">Upgrade or change plan</Link>
            {!isFree && !sub?.cancelAtPeriodEnd && (
              <button type="button" className="lp-cta explore" disabled={busy} onClick={() => act("CANCEL")}>Cancel subscription</button>
            )}
            {!isFree && sub?.cancelAtPeriodEnd && (
              <button type="button" className="lp-cta explore" disabled={busy} onClick={() => act("RESUME")}>Reactivate</button>
            )}
          </div>
        </section>

        <section className="billing-card" aria-label="Active path covered by your plan">
          <h3>What your plan covers</h3>
          {tier === "all-access" ? (
            <>
              <div className="bc-value">All five learning paths</div>
              <p className="bc-sub">General English · Business English · Fluency Track · IELTS · Cambridge — plus every feature, unlimited AI sessions.</p>
            </>
          ) : isFree ? (
            <>
              <div className="bc-value">Core curriculum</div>
              <p className="bc-sub">Lessons and progress tracking stay yours. Choose a path on Learning Paths whenever you are ready.</p>
              <Link className="lp-cta explore" href="/learning-paths" style={{ width: "fit-content" }}>Explore the five paths</Link>
            </>
          ) : (
            <>
              <div className="bc-value">{meta ? ("name" in meta ? meta.name : displayName) : displayName}</div>
              <p className="bc-sub">{meta && "tagline" in meta ? meta.tagline : ""} Switch to it any time from the header.</p>
            </>
          )}
        </section>

        <section className="billing-card" aria-label="Payment method">
          <h3>Payment method</h3>
          <div className="bc-value" style={{ fontSize: 15 }}>{sub && sub.provider !== "NONE" ? sub.provider : "No card on file"}</div>
          <p className="bc-sub">
            {sub && sub.provider !== "NONE"
              ? "Managed by your payment provider. Card details never touch English Wizard servers."
              : "When you subscribe, your payment is handled by our billing provider — we store only the subscription state."}
          </p>
        </section>

        <section className="billing-card" aria-label="Billing dates and history">
          <h3>Billing period</h3>
          <div className="bc-value" style={{ fontSize: 15 }}>{isFree ? "—" : `${fmtDate(sub?.periodStart ?? null)} → ${fmtDate(sub?.periodEnd ?? null)}`}</div>
          <p className="bc-sub">
            {sub?.externalReference ? `Provider reference: ${sub.externalReference}` : "Invoices appear here once a production payment provider is connected."}
          </p>
        </section>
      </div>

      <section className="explore-section" aria-label="Price reference">
        <h2>Plan reference (Worldwide · USD)</h2>
        <div className="billing-grid">
          {pricesForRegion(region).map((p) => (
            <div className="billing-card" key={p.product}>
              <h3>{p.name}</h3>
              <div className="bc-value">{formatPrice(p.monthly, p.currency)}<span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}> / mo</span></div>
              <p className="bc-sub">or {formatPrice(p.annual, p.currency)}/year · {p.trialDays}-day free trial</p>
            </div>
          ))}
        </div>
        <p className="subtle" style={{ fontSize: 12.5 }}>Egyptian pricing is shown in EGP on the plans page. Prices include the full trial terms — no hidden tiers.</p>
      </section>
    </main>
  );
}
