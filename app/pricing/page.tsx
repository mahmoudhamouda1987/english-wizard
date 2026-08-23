import Link from "next/link";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { SUBSCRIPTION_PLANS } from "@/src/domain/subscription";
import { PLAN_ENTITLEMENTS } from "@/src/domain/entitlements";

export const metadata = {
  title: "Pricing — English Wizard",
  description: "Start free forever. Upgrade when you feel the difference: 30 daily AI sessions, exam pathways, boss missions and unlimited speaking practice.",
};

const COMPARISON: Array<{ label: string; free: string; plus: string; pro: string }> = [
  { label: "Core curriculum (Pre-A1 → C2)", free: "Unlimited", plus: "Unlimited", pro: "Unlimited" },
  { label: "Spaced review & mistake intelligence", free: "Unlimited", plus: "Unlimited", pro: "Unlimited" },
  { label: "Portfolio & reality checkpoints", free: "✓", plus: "✓", pro: "✓" },
  { label: "Voice Time Machine", free: "✓", plus: "✓", pro: "✓" },
  { label: "AI teacher messages / day", free: "5", plus: "30", pro: "Unlimited" },
  { label: "AI speaking coach / day", free: "2", plus: "10", pro: "Unlimited" },
  { label: "Exam pathways (IELTS & Cambridge)", free: "—", plus: "✓", pro: "✓" },
  { label: "Deep study sessions", free: "—", plus: "3/day", pro: "Unlimited" },
  { label: "Boss missions", free: "—", plus: "1/day", pro: "Unlimited" },
];

const FAQ = [
  { q: "Is the free plan really forever?", a: "Yes. The full core curriculum, spaced review, portfolio, checkpoints and Voice Time Machine are unlimited and free — no trial clock, no credit card." },
  { q: "What exactly does the upgrade unlock?", a: "More AI practice per day (the one thing that costs us money), plus exam pathways, deep study and boss missions. Your learning data is never limited on any plan." },
  { q: "Can I pause instead of cancelling?", a: "Yes — pausing stops billing while keeping your streak freezes and history intact, and you can resume anytime." },
  { q: "Do certificates cost extra?", a: "No. Evidence-based certificates with QR verification are part of the platform on every plan." },
];

export default function PricingPage() {
  return (
    <>
      <header className="site-header">
        <Link className="site-brand" href="/"><img src="/logo.png" alt="English Wizard logo" width={38} height={38} /> English Wizard</Link>
        <nav className="site-nav" aria-label="Site">
          <Link href="/#how">How it works</Link>
          <a className="primary" href="/onboarding">Start learning</a>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main-content" style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>Simple, honest pricing</p>
        <h1 style={{ textAlign: "center", fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-.02em", margin: "8px 0 12px" }}>Free where it counts.<br />Paid where it makes you better.</h1>
        <p className="subtle" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px", fontSize: 17 }}>
          The core learning engine is unlimited and free forever. You pay only for the expensive parts — heavy AI practice and premium pathways.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
          {SUBSCRIPTION_PLANS.map((plan) => {
            const highlight = plan.tier === "PLUS";
            const quota = (feature: string) => PLAN_ENTITLEMENTS[plan.tier].find((e) => e.feature === feature);
            return (
              <section key={plan.tier} className="panel" style={{ margin: 0, padding: 28, border: highlight ? "2px solid #6840d6" : undefined, position: "relative" }}>
                {highlight && <span className="streak-pill" style={{ position: "absolute", top: -14, left: 24 }}>Most popular</span>}
                <h2 style={{ fontSize: 22 }}>{plan.name}</h2>
                <div style={{ fontSize: 40, fontWeight: 800, color: "#4626b8", margin: "6px 0 14px" }}>
                  {plan.tier === "FREE" ? "$0" : plan.priceLabel.replace(/[^0-9.]/g, "") ? `$${plan.priceLabel.replace(/[^0-9.]/g, "")}` : plan.priceLabel}
                  <small className="subtle" style={{ fontSize: 14, fontWeight: 400 }}>{plan.tier === "FREE" ? " forever" : " /month"}</small>
                </div>
                <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 9, lineHeight: 1.5 }}>
                  {plan.highlights.map((h) => <li key={h}>✓ {h}</li>)}
                  {quota("AI_TEACHER")?.dailyQuota && plan.tier !== "FREE" && <li>🔓 {quota("AI_TEACHER")!.dailyQuota === 30 ? "30" : "Unlimited"} AI teacher sessions daily</li>}
                </ul>
                <a className={highlight ? "button" : "button secondary"} href={plan.tier === "FREE" ? "/onboarding" : `/auth?next=${encodeURIComponent("/settings#plan")}`} style={{ display: "block", textAlign: "center", marginTop: 20 }}>
                  {plan.tier === "FREE" ? "Start free" : `Choose ${plan.name}`}
                </a>
              </section>
            );
          })}
        </div>

        <section aria-label="Full comparison" style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 26, marginBottom: 16 }}>Everything compared</h2>
          <div className="panel" style={{ padding: 0, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ padding: 14 }}></th><th style={{ padding: 14 }}>Free</th><th style={{ padding: 14 }}>Plus</th><th style={{ padding: 14 }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{row.label}</td>
                    <td style={{ padding: 12 }}>{row.free}</td>
                    <td style={{ padding: 12 }}>{row.plus}</td>
                    <td style={{ padding: 12 }}>{row.pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: 56 }}>
          <h2 style={{ fontSize: 26, marginBottom: 16 }}>Questions people ask</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {FAQ.map((item) => (
              <details key={item.q} className="panel" style={{ margin: 0, padding: "16px 20px" }}>
                <summary style={{ cursor: "pointer", fontWeight: 700 }}>{item.q}</summary>
                <p className="subtle" style={{ marginTop: 10, lineHeight: 1.7 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="hero-band" style={{ marginTop: 64, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", letterSpacing: "-.02em", margin: "0 0 12px" }}>Hear yourself improve within weeks.</h2>
          <p style={{ opacity: .92, maxWidth: 560, margin: "0 auto 22px", fontSize: 17 }}>Record your voice today, compare it with your voice in three months — and carry a QR-verifiable certificate employers can check.</p>
          <a href="/onboarding" style={{ background: "#fff", color: "#4626b8", padding: "14px 28px", borderRadius: 12, fontWeight: 800, display: "inline-block" }}>Start free — no card needed →</a>
        </section>
      </main>
    </>
  );
}
