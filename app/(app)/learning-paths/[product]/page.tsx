"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { productMeta } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import { AUDIT_MODE, productAccessState, type CatalogueProduct, type PlanTier } from "@/src/domain/entitlements";
import { annualSavingPct, formatPrice, pricesForRegion, type RegionCode } from "@/src/domain/pricing";
import { IconCheck } from "@/app/components/nav-icons";

/**
 * EXPLORE — the product preview page (spec §8). A locked learner sees the
 * full value story — what it provides, who it is for, curriculum, features,
 * sample content, outcomes, pricing and trial eligibility — and can start a
 * trial or choose the path. Premium content itself stays behind the gate.
 */
export default function ExplorePathPage() {
  const params = useParams<{ product: string }>();
  const productId = String(params?.product ?? "");
  const meta = productMeta(productId);
  const [tier, setTier] = useState<PlanTier | null>(null);
  const [activeProduct, setActiveProduct] = useState<CatalogueProduct | null>(null);
  const [region, setRegion] = useState<RegionCode>("WW");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscription", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (!cancelled && s?.effectiveTier) setTier(String(s.effectiveTier) as PlanTier); })
      .catch(() => { /* neutral */ });
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (!cancelled && p?.profile?.activeProduct) setActiveProduct(p.profile.activeProduct as CatalogueProduct); })
      .catch(() => { /* neutral */ });
    return () => { cancelled = true; };
  }, []);

  if (!meta) {
    return (
      <main id="main-content" className="dash-main">
        <div className="state-card error" role="alert">
          <strong>That learning path doesn&rsquo;t exist.</strong>
          <p style={{ margin: "6px 0 12px" }}>Head back to Learning Paths to see the five journeys.</p>
          <Link href="/learning-paths" className="button">Back to Learning Paths</Link>
        </div>
      </main>
    );
  }

  const Icon = PRODUCT_ICON_COMPONENTS[meta.icon];
  const state = productAccessState(tier ?? "FREE", meta.id, activeProduct);
  const price = pricesForRegion(region).find((e) => e.product === meta.id);

  return (
    <main id="main-content" className="dash-main page-stack">
      <nav aria-label="Breadcrumb" className="subtle" style={{ fontSize: 12.5, display: "flex", gap: 7, alignItems: "center" }}>
        <Link href="/learning-paths" style={{ color: "var(--accent-text)", fontWeight: 700, textDecoration: "none" }}>Learning Paths</Link>
        <span aria-hidden="true">/</span>
        <span>{meta.name}</span>
      </nav>

      <header className="explore-hero">
        <span className="lp-icon" style={{ background: meta.gradient }} aria-hidden="true"><Icon size={30} /></span>
        <div>
          <h1>{meta.name}</h1>
          <p>{meta.tagline} {meta.audience}</p>
          <div className="dh-context" style={{ marginTop: 10 }}>
            <span className="dh-chip neutral">{meta.levelRange}</span>
            {state !== "LOCKED" && (
              <span className="lp-state active"><IconCheck size={12} /> In your membership</span>
            )}
            {state === "LOCKED" && meta.trialEligible && (
              <span className="lp-state locked">7-day free trial available</span>
            )}
          </div>
        </div>
      </header>

      <section className="explore-section" aria-label="Expected outcomes">
        <h2>Where this path takes you</h2>
        <p className="subtle" style={{ margin: 0, fontSize: 14.5 }}>{meta.outcome}</p>
      </section>

      <section className="explore-section" aria-label="What this product provides">
        <h2>What it provides</h2>
        <ul className="explore-list">
          {meta.features.map((f) => (
            <li key={f}><span className="tick" aria-hidden="true"><IconCheck size={14} /></span>{f}</li>
          ))}
        </ul>
      </section>

      <section className="explore-section" aria-label="Curriculum">
        <h2>The journey, module by module</h2>
        <ol className="curriculum-list">
          {meta.curriculum.map((m) => <li key={m}>{m}</li>)}
        </ol>
      </section>

      <section className="explore-section" aria-label="Sample content">
        <h2>A taste of the content</h2>
        <div className="sample-card">
          <strong>{meta.sample.title}</strong>
          <p>{meta.sample.body}</p>
        </div>
      </section>

      {state !== "LOCKED" ? (
        <section className="state-card info" aria-label="Access">
          <strong>You already have {meta.name}.</strong>
          <p style={{ margin: "6px 0 12px" }}>Everything on this path is open to you — continue where you stopped.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="button" href={meta.href}>Continue on this path</Link>
            <Link className="button secondary" href="/learning-paths">Back to all paths</Link>
          </div>
        </section>
      ) : (
        <section className="explore-section" aria-label="Pricing">
          <h2>Choose how you start</h2>
          {price && (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Region">
                {(["WW", "EG"] as RegionCode[]).map((code) => (
                  <button key={code} type="button" aria-pressed={region === code} onClick={() => setRegion(code)}
                    className={region === code ? "button" : "button secondary"} style={{ padding: "7px 14px", fontSize: 13 }}>
                    {code === "WW" ? "Worldwide (USD)" : "Egypt (EGP)"}
                  </button>
                ))}
              </div>
              <div className="billing-grid">
                <div className="billing-card">
                  <h3>Monthly</h3>
                  <div className="bc-value">{formatPrice(price.monthly, price.currency)}<span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}> / month</span></div>
                  <p className="bc-sub">Full access to {meta.name}. Cancel any time from Billing.</p>
                </div>
                <div className="billing-card">
                  <h3>Annual — save {annualSavingPct(price)}%</h3>
                  <div className="bc-value">{formatPrice(price.annual, price.currency)}<span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 600 }}> / year</span></div>
                  <p className="bc-sub">Twelve months of the full path for the price of {Math.max(1, Math.round(price.annual / price.monthly))} months.</p>
                </div>
              </div>
              {meta.trialEligible && (
                <p className="subtle" style={{ margin: 0, fontSize: 13 }}>Every plan starts with a <strong>{price.trialDays}-day free trial</strong> — the complete path, nothing held back.</p>
              )}
            </>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
            <Link className="button" href={`/plan?product=${meta.id}`} style={{ textDecoration: "none" }}>
              {meta.trialEligible ? "Start 7-day trial" : "Choose this path"}
            </Link>
            <Link className="button secondary" href="/learning-paths">Back to all paths</Link>
            {AUDIT_MODE && (
              <span className="lp-audit-note"><span className="dot" aria-hidden="true" /> Audit mode: you can also open the path directly.</span>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
