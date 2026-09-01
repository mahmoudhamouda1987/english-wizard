"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productMeta } from "@/src/domain/product-catalogue";
import { PRODUCT_ICON_COMPONENTS } from "@/app/components/nav-config";
import type { CatalogueProduct } from "@/src/domain/entitlements";

/**
 * CURRENT PATH BANNER (learning-paths IA) — one framework, product-specific
 * context. Drops the learner's current path onto any adaptive surface
 * (My Journey, Progress & Insights, Worlds & Missions) and follows switches
 * instantly via the `ew-path-changed` event the hub and the header switcher
 * broadcast. Never a second dashboard — a context strip, one per page.
 */
export function CurrentPathBanner({ cta = "Path home" }: { cta?: string }) {
  const [activeProduct, setActiveProduct] = useState<CatalogueProduct | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => { if (!cancelled && p?.profile?.activeProduct) setActiveProduct(p.profile.activeProduct as CatalogueProduct); })
      .catch(() => { /* neutral default holds */ });
    function onPathChanged(e: Event) {
      const detail = (e as CustomEvent<{ productId?: string }>).detail;
      if (detail?.productId) setActiveProduct(detail.productId as CatalogueProduct);
    }
    window.addEventListener("ew-path-changed", onPathChanged);
    return () => { cancelled = true; window.removeEventListener("ew-path-changed", onPathChanged); };
  }, []);

  const meta = productMeta(activeProduct ?? "general-english");
  if (!meta) return null;
  const Icon = PRODUCT_ICON_COMPONENTS[meta.icon];

  return (
    <section className="current-path-banner" aria-label="Current path context">
      <span className="lp-icon" style={{ background: meta.gradient }} aria-hidden="true"><Icon size={20} /></span>
      <div>
        <div className="cpb-label">Current path</div>
        <div className="cpb-name">{meta.name}</div>
        <div className="cpb-meta">{meta.tagline}</div>
      </div>
      <Link className="lp-cta primary" href={meta.href}>{cta}</Link>
    </section>
  );
}
