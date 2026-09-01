"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCT_CATALOGUE, productMeta } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import { AUDIT_MODE, productAccessState, type CatalogueProduct, type PlanTier } from "@/src/domain/entitlements";
import { formatPrice, pricesForRegion, type RegionCode } from "@/src/domain/pricing";
import { IconCheck, IconLock } from "@/app/components/nav-icons";

interface DashLite { level: string; nextLevel: string; overallPercent: number }

/**
 * LEARNING PATHS — the commercial spine (spec §5–§14). The only place the
 * five products appear together: access states, progress, one CTA each.
 * The sidebar answers "what can I do?"; this page answers "which journey?".
 */
export default function LearningPathsPage() {
  const router = useRouter();
  const [tier, setTier] = useState<PlanTier | null>(null);
  const [activeProduct, setActiveProduct] = useState<CatalogueProduct | null>(null);
  const [dash, setDash] = useState<DashLite | null>(null);
  const [region] = useState<RegionCode>("WW");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscription", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (!cancelled && s?.effectiveTier) setTier(String(s.effectiveTier) as PlanTier); })
      .catch(() => { /* cards stay neutral */ });
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (cancelled || !p?.profile) return;
        if (p.profile.activeProduct) setActiveProduct(p.profile.activeProduct as CatalogueProduct);
      })
      .catch(() => { /* default to General English */ });
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.level) return;
        setDash({ level: String(d.level), nextLevel: String(d.nextLevel ?? ""), overallPercent: Number(d.overallPercent) || 0 });
      })
      .catch(() => { /* progress lines stay hidden */ });
    function onPathChanged(e: Event) {
      const detail = (e as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId) setActiveProduct(detail.productId as CatalogueProduct);
    }
    window.addEventListener("ew-path-changed", onPathChanged);
    return () => { cancelled = true; window.removeEventListener("ew-path-changed", onPathChanged); };
  }, []);

  const current = productMeta(activeProduct ?? "general-english");
  const allAccess = tier === "all-access";

  async function switchPath(product: CatalogueProduct) {
    setActiveProduct(product);
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ activeProduct: product }),
    }).catch(() => null);
    if (res && !res.ok && res.status === 403) {
      router.push(`/learning-paths/${product}`);
      return;
    }
    window.dispatchEvent(new CustomEvent("ew-path-changed", { detail: { productId: product } }));
  }

  return (
    <main id="main-content" className="dash-main page-stack">
      <header className="lp-head">
        <span className="lp-eyebrow">Your membership</span>
        <h1>Learning Paths</h1>
        <p className="subtle">Choose the journey that matches your goal. Five complete products — one English Wizard membership.</p>
      </header>

      <section className="current-path-banner" aria-label="Your current path">
        <span className="lp-icon" style={{ background: current?.gradient }} aria-hidden="true">
          {current && (() => { const Icon = PRODUCT_ICON_COMPONENTS[current.icon]; return <Icon size={20} />; })()}
        </span>
        <div>
          <div className="cpb-label">Current path</div>
          <div className="cpb-name">{current?.name}</div>
          <div className="cpb-meta">{dash ? `${dash.level}${dash.nextLevel ? ` · next milestone ${dash.nextLevel}` : ""}` : "Your level follows you across every path"}</div>
        </div>
        <Link className="lp-cta primary" href={current?.href ?? "/general-english"}>Continue</Link>
      </section>

      {allAccess && (
        <section className="lp-allaccess" aria-label="All Access membership">
          <div>
            <strong>All Access</strong>
            <p>You have access to the complete English Wizard learning ecosystem — every path is open, no locks.</p>
          </div>
        </section>
      )}

      {AUDIT_MODE && !allAccess && (
        <p className="lp-audit-note"><span className="dot" aria-hidden="true" /> Build phase: every path is open to audit — badges show the intended commercial state.</p>
      )}

      <div className="lp-grid">
        {PRODUCT_CATALOGUE.map((p) => {
          const Icon = PRODUCT_ICON_COMPONENTS[p.icon];
          const state = productAccessState(tier ?? "FREE", p.id, activeProduct);
          const price = tier && state === "LOCKED" ? pricesForRegion(region).find((e) => e.product === p.id) : undefined;
          const isCurrent = state === "CURRENT";
          return (
            <article key={p.id} className={`lp-card ${isCurrent ? "current" : ""}`} aria-label={`${p.name} — ${state.toLowerCase()}`}>
              <div className="lp-card-top">
                <span className="lp-icon" style={{ background: p.gradient }} aria-hidden="true"><Icon size={22} /></span>
                <div className="lp-name-block">
                  <h2 className="lp-name">{p.name}</h2>
                  <p className="lp-tag">{p.tagline}</p>
                </div>
              </div>
              <div className="lp-facts">
                <span className="lp-fact">{p.levelRange}</span>
                <span className="lp-fact">{p.audience.split("—")[0].trim().slice(0, 48)}</span>
              </div>
              <div className="lp-state-row">
                <span className={`lp-state ${state.toLowerCase()}`}>
                  {state === "CURRENT" && <><IconCheck size={12} /> Current path</>}
                  {state === "ACTIVE" && <><IconCheck size={12} /> Active</>}
                  {state === "LOCKED" && <><IconLock size={11} /> Not subscribed</>}
                </span>
                {price && <span className="lp-price-hint">From {formatPrice(price.monthly, price.currency)}/mo · {price.trialDays}-day trial</span>}
              </div>
              {isCurrent && dash && (
                <div className="lp-progress">
                  <div className="track" role="img" aria-label={`${dash.overallPercent}% towards ${dash.nextLevel || "the next level"}`}>
                    <span style={{ width: `${Math.max(4, dash.overallPercent)}%` }} />
                  </div>
                  <small>{dash.overallPercent}% towards {dash.nextLevel || "the next level"}</small>
                </div>
              )}
              <div className="lp-actions">
                {state === "LOCKED" ? (
                  <>
                    <Link className="lp-cta explore" href={`/learning-paths/${p.id}`}>Explore</Link>
                    {AUDIT_MODE && (
                      <button type="button" className="lp-cta primary" onClick={() => switchPath(p.id)} title="Audit mode: preview this path with full access">Preview path</button>
                    )}
                  </>
                ) : isCurrent ? (
                  <Link className="lp-cta primary" href={p.href}>Continue</Link>
                ) : (
                  <>
                    <button type="button" className="lp-cta primary" onClick={() => switchPath(p.id)}>Switch to this path</button>
                    <Link className="lp-cta explore" href={p.href}>Open</Link>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
