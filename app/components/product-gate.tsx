"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { productMeta } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import { AUDIT_MODE, productAccessible, type CatalogueProduct, type PlanTier } from "@/src/domain/entitlements";
import { IconLock } from "@/app/components/nav-icons";

/**
 * PRODUCT GATE (learning-paths spec §6/§8) — enforcement boundary for a
 * product's content routes. In audit mode everything stays open (badges show
 * intent, nothing is enforced); with AUDIT_MODE=false a learner without the
 * entitlement sees a premium restricted-state panel — never premium content.
 */
export function ProductGate({ product, children }: { product: CatalogueProduct; children: ReactNode }) {
  const [tier, setTier] = useState<PlanTier | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/subscription", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (cancelled) return;
        if (s?.effectiveTier) setTier(String(s.gatingTier ?? s.effectiveTier) as PlanTier);
        setLoaded(true);
      })
      .catch(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  if (!loaded) {
    return (
      <main id="main-content" className="dash-main" aria-busy="true">
        <div className="skeleton" style={{ height: 120, borderRadius: 18 }} />
        <div className="skeleton" style={{ height: 220, borderRadius: 18, marginTop: 14 }} />
      </main>
    );
  }

  const open = !tier || productAccessible(tier, product);
  if (open) return <>{children}</>;

  const meta = productMeta(product);
  const Icon = PRODUCT_ICON_COMPONENTS[meta?.icon ?? "globe"];

  return (
    <main id="main-content" className="dash-main page-stack">
      <section className="locked-panel" aria-label={`${meta?.name} is a premium path`}>
        <span className="lp-icon" style={{ background: meta?.gradient }} aria-hidden="true"><Icon size={26} /></span>
        <span className="lp-state locked"><IconLock size={11} /> Premium path</span>
        <h2>{meta?.name}</h2>
        <p>{meta?.tagline} {meta?.audience}</p>
        <p className="subtle" style={{ fontSize: 13 }}>
          This path is not part of your current subscription. Explore the full curriculum, outcomes and pricing — then choose it when you are ready.
        </p>
        <div className="lp-actions">
          <Link className="lp-cta primary" href={`/learning-paths/${product}`}>Explore this path</Link>
          <Link className="lp-cta explore" href="/learning-paths">All five paths</Link>
        </div>
        {AUDIT_MODE && (
          <p className="lp-audit-note" style={{ marginTop: 8 }}><span className="dot" aria-hidden="true" /> Audit note: this gate enforces only when audit mode is switched off.</p>
        )}
      </section>
    </main>
  );
}
