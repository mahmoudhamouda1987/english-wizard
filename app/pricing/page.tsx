import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { SUBSCRIPTION_PLANS } from "@/src/domain/subscription";
import { PLAN_ENTITLEMENTS } from "@/src/domain/entitlements";
import { TRIAL_DURATION_DAYS } from "@/src/domain/trial";

export const metadata = {
  title: "Pricing — English Wizard",
  description: "Choose your product, then your plan. Start free forever, try everything premium for 7 days, and upgrade only where it makes you better.",
};

/**
 * Product-led pricing (Part 109): show what each product is for and what it
 * achieves before any plan numbers. Routes are the five 2.0 product surfaces.
 * General English is the core engine and is included on every plan.
 */
const PRODUCTS: Array<{ name: string; href: string; badge?: string; forLine: string; achieves: string }> = [
  {
    name: "General English",
    href: "/general-english",
    badge: "Included in every plan",
    forLine: "For anyone building dependable everyday English, from first words to full working fluency.",
    achieves: "Takes you from Pre-A1 to C2 across listening, speaking, reading and writing — one measurable step at a time.",
  },
  {
    name: "Business English",
    href: "/business-english",
    forLine: "For professionals who need English that works in meetings, emails and interviews.",
    achieves: "Turns workplace knowledge into clear, confident professional communication — documented with evidence you can show.",
  },
  {
    name: "IELTS",
    href: "/ielts",
    forLine: "For candidates chasing a specific band score, Academic or General Training.",
    achieves: "Structured preparation for all four papers: teach, guided practice, timed runs and honest band feedback.",
  },
  {
    name: "Cambridge",
    href: "/cambridge",
    forLine: "For learners who want a qualification employers recognise.",
    achieves: "Exam-ready preparation from A2 Key to C2 Proficiency, with readiness checks before you book the real exam.",
  },
  {
    name: "Fluency Track",
    href: "/fluency-track",
    forLine: "For B1+ speakers who understand English but freeze when it is their turn to talk.",
    achieves: "Builds spoken fluency through explanation, drills, guided role-plays and pressure tests, from B1 to C2.",
  },
];

/** Trial explainer (Part 129). Numbers come from the domain — nothing invented here. */
const TRIAL_STEPS: Array<{ label: string; text: string }> = [
  {
    label: `Day 1 of ${TRIAL_DURATION_DAYS}`,
    text: "Placement sets your level and full premium access begins immediately — no card needed to start.",
  },
  {
    label: `Days 2–${TRIAL_DURATION_DAYS}`,
    text: "Every premium surface stays open: exam pathways, deep study, boss missions and your full daily AI teacher allowance.",
  },
  {
    label: `After day ${TRIAL_DURATION_DAYS}`,
    text: "Your profile, reports and history are preserved exactly as they are. Premium features lock until you choose a plan — the free engine keeps running.",
  },
];

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
  { q: "What happens when the 7-day trial ends?", a: "Nothing disappears. Your profile, reports and full history stay put; premium features simply lock until you pick a plan. You keep learning on the free engine." },
  { q: "Can I pause instead of cancelling?", a: "Yes — pausing stops billing while keeping your streak freezes and history intact, and you can resume anytime." },
  { q: "Do certificates cost extra?", a: "No. Evidence-based certificates with QR verification are part of the platform on every plan." },
];

export default function PricingPage() {
  return (
    <>
      <header className="site-header">
        <Link className="site-brand" href="/"><Image src="/logo.png" alt="English Wizard logo" width={38} height={38} unoptimized /> English Wizard</Link>
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

        {/* ---------- Choose your product (Part 109) ---------- */}
        <section aria-labelledby="products-heading" style={{ marginBottom: 56 }}>
          <p className="eyebrow" style={{ textAlign: "center" }}>Choose your product</p>
          <h2 id="products-heading" style={{ textAlign: "center", fontSize: "clamp(24px, 3.4vw, 34px)", letterSpacing: "-.02em", margin: "8px auto 10px", maxWidth: 640 }}>
            Five focused products. One learning engine.
          </h2>
          <p className="subtle" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 24px" }}>
            Every plan runs on the same engine. Pick the product that matches your goal — the plan decides how hard you can push it.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 }}>
            {PRODUCTS.map((product) => (
              <article key={product.name} className="panel" style={{ margin: 0, padding: 20, display: "grid", gap: 10, alignContent: "start" }}>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 17 }}>{product.name}</h3>
                  {product.badge && <span className="pill">{product.badge}</span>}
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}><strong>For:</strong> {product.forLine}</p>
                <p className="subtle" style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>What it achieves: {product.achieves}</p>
                <Link href={product.href} style={{ color: "var(--accent-text)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
                  Learn more about {product.name} →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Plans (numbers render from live plan data — Part 109) ---------- */}
        <section aria-labelledby="plans-heading">
          <p className="eyebrow" style={{ textAlign: "center" }}>Then choose your plan</p>
          <h2 id="plans-heading" style={{ textAlign: "center", fontSize: "clamp(24px, 3.4vw, 34px)", letterSpacing: "-.02em", margin: "8px 0 8px" }}>Pick the plan that fits how much you practise.</h2>
          <p className="subtle" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 28px" }}>
            Exact commercial plans are configurable — this page reflects the current live plans.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
            {SUBSCRIPTION_PLANS.map((plan) => {
              const highlight = plan.tier === "PLUS";
              const quota = (feature: string) => PLAN_ENTITLEMENTS[plan.tier].find((e) => e.feature === feature);
              return (
                <section key={plan.tier} className="panel" style={{ margin: 0, padding: 28, border: highlight ? "2px solid var(--accent-primary)" : undefined, position: "relative" }}>
                  {highlight && <span className="streak-pill" style={{ position: "absolute", top: -14, left: 24 }}>Most popular</span>}
                  <h3 style={{ fontSize: 22 }}>{plan.name}</h3>
                  <div style={{ fontSize: 40, fontWeight: 800, color: "var(--accent-text)", margin: "6px 0 14px" }}>
                    {plan.tier === "FREE" ? "$0" : plan.priceLabel.replace(/[^0-9.]/g, "") ? `$${plan.priceLabel.replace(/[^0-9.]/g, "")}` : plan.priceLabel}
                    <small className="subtle" style={{ fontSize: 14, fontWeight: 400 }}>{plan.tier === "FREE" ? " forever" : " /month"}</small>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 9, lineHeight: 1.5 }}>
                    {plan.highlights.map((h) => <li key={h}>✓ {h}</li>)}
                    {quota("AI_TEACHER")?.dailyQuota && plan.tier !== "FREE" && <li>✓ {quota("AI_TEACHER")!.dailyQuota === 30 ? "30" : "Unlimited"} AI teacher sessions daily</li>}
                  </ul>
                  <a className={highlight ? "button" : "button secondary"} href={plan.tier === "FREE" ? "/onboarding" : `/auth?next=${encodeURIComponent("/settings#plan")}`} style={{ display: "block", textAlign: "center", marginTop: 20 }}>
                    {plan.tier === "FREE" ? "Start free" : `Choose ${plan.name}`}
                  </a>
                </section>
              );
            })}
          </div>
        </section>

        {/* ---------- Trial explainer (Part 129) ---------- */}
        <section aria-labelledby="trial-heading" className="panel" style={{ marginTop: 40, padding: "26px 28px" }}>
          <p className="eyebrow">7-day trial</p>
          <h2 id="trial-heading" style={{ fontSize: 22, margin: "8px 0 6px" }}>How your first week works</h2>
          <p className="subtle" style={{ margin: "0 0 18px", maxWidth: 720 }}>
            Every new learner can open a {TRIAL_DURATION_DAYS}-day premium trial. It is a calm week, not a countdown you have to fight.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
            {TRIAL_STEPS.map((step) => (
              <div key={step.label} style={{ borderLeft: "2px solid var(--border-default)", paddingLeft: 14 }}>
                <p className="eyebrow" style={{ marginBottom: 6 }}>{step.label}</p>
                <p className="subtle" style={{ margin: 0, fontSize: 14 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

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

        {/* ---------- For Organizations (Part 94) ---------- */}
        <section aria-labelledby="org-heading" className="panel" style={{ marginTop: 40, padding: "26px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
          <div style={{ flex: "1 1 420px" }}>
            <p className="eyebrow">For organizations</p>
            <h2 id="org-heading" style={{ fontSize: 22, margin: "8px 0 8px" }}>Schools, teams and training providers.</h2>
            <p className="subtle" style={{ margin: 0, maxWidth: 680 }}>
              Roll English Wizard out across a class or a company: accurate placement before training budgets are spent, deliberate development with visible progress, and professional reporting for teams and stakeholders. We will shape a plan around your cohort.
            </p>
          </div>
          <Link className="button secondary" href="/#organizations" style={{ flex: "none" }}>Talk to us</Link>
        </section>

        <section className="hero-band" style={{ marginTop: 64, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", letterSpacing: "-.02em", margin: "0 0 12px" }}>Hear yourself improve within weeks.</h2>
          <p style={{ opacity: .92, maxWidth: 560, margin: "0 auto 22px", fontSize: 17 }}>Record your voice today, compare it with your voice in three months — and carry a QR-verifiable certificate employers can check.</p>
          <a href="/onboarding" style={{ background: "var(--bg-elevated)", color: "var(--accent-text)", padding: "14px 28px", borderRadius: 12, fontWeight: 800, display: "inline-block" }}>Start free — no card needed →</a>
        </section>
      </main>
    </>
  );
}
