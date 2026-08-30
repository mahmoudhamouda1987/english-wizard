"use client";

/* Pricing plans (spec Parts 77–88): choose your path → one price per product,
 * monthly or yearly with the annual saving, then All Access. All numbers come
 * from src/domain/pricing — nothing is hardcoded here. Region defaults to
 * Worldwide; the Egypt switch is an explicit user choice until a billing
 * country is known (Part 81: billing country authoritative, IP secondary). */

import { useState } from "react";
import Link from "next/link";
import {
  pricesForRegion, formatPrice, annualSavingPct,
  type PriceEntry, type RegionCode,
} from "@/src/domain/pricing";

type Period = "monthly" | "yearly";

const LEVEL_LINES: Record<string, string> = {
  "general-english": "Pre-A1 → C2",
  "business-english": "B1 → C2 · workplace outcomes",
  "fluency-track": "B1 → C2 · spoken fluency",
  "ielts": "Target band 4.0 – 9.0",
  "cambridge": "A2 Key → C2 Proficiency",
};

function PlanCard({ plan, period, highlight }: { plan: PriceEntry; period: Period; highlight?: boolean }) {
  const pct = annualSavingPct(plan);
  return (
    <section className="panel" style={{ margin: 0, padding: 26, display: "grid", gap: 12, alignContent: "start", border: highlight ? "2px solid var(--accent-primary)" : undefined, position: "relative" }}>
      {highlight && <span className="streak-pill" style={{ position: "absolute", top: -14, left: 22 }}>Best value</span>}
      <h3 style={{ margin: 0, fontSize: 20 }}>{plan.name}</h3>
      <p className="subtle" style={{ margin: 0, fontSize: 13.5 }}>{plan.positioning}</p>
      <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "var(--accent-text)" }}>{LEVEL_LINES[plan.product]}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-.02em", color: "var(--text-primary)" }}>
          {formatPrice(period === "monthly" ? plan.monthly : plan.annual, plan.currency)}
        </strong>
        <span className="subtle" style={{ fontSize: 14 }}>/ {period === "monthly" ? "month" : "year"}</span>
      </div>
      <p className="subtle" style={{ margin: 0, fontSize: 13 }}>
        {period === "yearly"
          ? `You save ${formatPrice(plan.annualSaving, plan.currency)} a year (${pct}% off monthly).`
          : `Or ${formatPrice(plan.annual, plan.currency)}/year — save ${pct}%.`}
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 7, fontSize: 14, lineHeight: 1.5 }}>
        {plan.entitlements.features.map((f) => <li key={f}>✓ {f}</li>)}
      </ul>
      <Link
        className={highlight ? "button" : "button secondary"}
        href="/onboarding"
        style={{ display: "block", textAlign: "center", marginTop: 6, textDecoration: "none" }}
      >
        Start 7-day trial
      </Link>
    </section>
  );
}

export function PricingPlans() {
  const [region, setRegion] = useState<RegionCode>("WW");
  const [period, setPeriod] = useState<Period>("monthly");
  const plans = pricesForRegion(region);
  const products = plans.filter((p) => p.product !== "all-access");
  const allAccess = plans.find((p) => p.product === "all-access")!;

  const seg = (active: boolean): React.CSSProperties => ({
    padding: "8px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
    border: "1px solid " + (active ? "var(--accent-primary)" : "var(--border-default)"),
    background: active ? "var(--accent-soft, var(--surface-card))" : "transparent",
    color: active ? "var(--accent-text)" : "var(--text-secondary)",
  });

  return (
    <>
      {/* ── Region + period controls ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", alignItems: "center", marginBottom: 30 }}>
        <div role="group" aria-label="Region" style={{ display: "inline-flex", gap: 8 }}>
          <button type="button" style={seg(region === "WW")} aria-pressed={region === "WW"} onClick={() => setRegion("WW")}>Worldwide (USD)</button>
          <button type="button" style={seg(region === "EG")} aria-pressed={region === "EG"} onClick={() => setRegion("EG")}>Egypt (EGP)</button>
        </div>
        <div role="group" aria-label="Billing period" style={{ display: "inline-flex", gap: 8 }}>
          <button type="button" style={seg(period === "monthly")} aria-pressed={period === "monthly"} onClick={() => setPeriod("monthly")}>Monthly</button>
          <button type="button" style={seg(period === "yearly")} aria-pressed={period === "yearly"} onClick={() => setPeriod("yearly")}>Yearly · save up to {annualSavingPct(allAccess)}%</button>
        </div>
      </div>

      {/* ── Choose your path: one price per product ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
        {products.map((p) => <PlanCard key={p.product} plan={p} period={period} />)}
      </div>

      {/* ── All Access (Part 87) ── */}
      <section aria-labelledby="all-access-heading" style={{ marginTop: 56 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <p className="eyebrow">All Access</p>
          <h2 id="all-access-heading" style={{ fontSize: "clamp(24px,3.4vw,34px)", letterSpacing: "-.02em", margin: "8px 0 6px" }}>
            One subscription. The complete English Wizard ecosystem.
          </h2>
          <p className="subtle" style={{ maxWidth: 620, margin: "0 auto" }}>
            General English, Business English, Fluency Track, IELTS and Cambridge — every product, every level, every report.
          </p>
        </div>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <PlanCard plan={allAccess} period={period} highlight />
        </div>
      </section>
    </>
  );
}
