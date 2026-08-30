import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { PricingPlans } from "./plans";
import { TRIAL_DURATION_DAYS } from "@/src/domain/trial";

export const metadata = {
  title: "Pricing",
  description: "One price per product, or All Access. Start with a 7-day trial, then choose the path that fits your goal.",
};

/** Trial explainer (Parts 84–86): a guided week, then an honest choice. */
const TRIAL_STEPS: Array<{ label: string; text: string }> = [
  {
    label: `Day 1 of ${TRIAL_DURATION_DAYS}`,
    text: "LevelCheck places your level and your chosen product opens immediately — no card needed to start.",
  },
  {
    label: `Days 2–${TRIAL_DURATION_DAYS}`,
    text: "Learn, practise and measure on your chosen path. Your dashboard shows Day X of 7 so you always know where you stand.",
  },
  {
    label: `After day ${TRIAL_DURATION_DAYS}`,
    text: "Your profile, level, reports, Student ID and full history are preserved exactly as they are. Subscription unlocks the learning — monthly, yearly, or All Access.",
  },
];

const FAQ = [
  { q: "Is there a free plan?", a: "Every new learner gets a full 7-day trial of the product they choose — no card needed. After the trial, a subscription keeps the learning going. There is no permanent free tier, and we are honest about that." },
  { q: "What happens to my data when the trial ends?", a: "Nothing disappears. Your level, assessment reports, Student ID, portfolio and history are preserved. A subscription simply reopens the learning surfaces." },
  { q: "Can I switch products later?", a: "Yes. Each product is one subscription, so you can add another path — or move to All Access, which unlocks all five products for one price." },
  { q: "Why do prices differ between Egypt and worldwide?", a: "Egypt has its own pricing, set for local value — not a currency conversion. The same premium product, priced to be reachable where you live." },
  { q: "Do certificates and reports cost extra?", a: "No. Placement reports, PDF downloads and QR-verifiable certificates are part of every product while subscribed." },
  { q: "Can I pause instead of cancelling?", a: "Yes — pausing stops billing while keeping your history intact, and you can resume anytime." },
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
        <p style={{ textAlign: "center", fontSize: 15, fontWeight: 600, letterSpacing: ".04em", margin: "0 0 10px", color: "var(--text-secondary)" }}>Intelligent English. Measurable Progress.</p>
        <h1 style={{ textAlign: "center", fontSize: "clamp(32px, 5vw, 52px)", letterSpacing: "-.02em", margin: "8px 0 12px" }}>
          One price per product.<br />One subscription for everything.
        </h1>
        <p className="subtle" style={{ textAlign: "center", maxWidth: 660, margin: "0 auto 40px", fontSize: 17 }}>
          Start your 7-day trial — no card needed. Then choose the product that fits your goal,
          or All Access for the complete ecosystem. Monthly or yearly, with a saving when you commit.
        </p>

        {/* ---------- Choose your path + All Access (Parts 77/82/87) ---------- */}
        <PricingPlans />

        {/* ---------- Trial explainer (Parts 84–86) ---------- */}
        <section aria-labelledby="trial-heading" className="panel" style={{ marginTop: 56, padding: "26px 28px" }}>
          <p className="eyebrow">{TRIAL_DURATION_DAYS}-day trial</p>
          <h2 id="trial-heading" style={{ fontSize: 22, margin: "8px 0 6px" }}>How your first week works</h2>
          <p className="subtle" style={{ margin: "0 0 18px", maxWidth: 720 }}>
            Every new learner opens a {TRIAL_DURATION_DAYS}-day trial with meaningful access to their chosen product. It is a guided week, not a countdown you have to fight.
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

        {/* ---------- For Organisations (Part 94) ---------- */}
        <section aria-labelledby="org-heading" className="panel" style={{ marginTop: 40, padding: "26px 28px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
          <div style={{ flex: "1 1 420px" }}>
            <p className="eyebrow">For Organisations</p>
            <h2 id="org-heading" style={{ fontSize: 22, margin: "8px 0 8px" }}>Schools, teams and training providers.</h2>
            <p className="subtle" style={{ margin: 0, maxWidth: 680 }}>
              Roll English Wizard out across a class or a company: accurate placement before training budgets are spent, deliberate development with visible progress, and professional reporting for teams and stakeholders. We will shape a plan around your cohort.
            </p>
          </div>
          <Link className="button secondary" href="/#organizations" style={{ flex: "none" }}>Talk to us</Link>
        </section>

        <section className="hero-band" style={{ marginTop: 64, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,40px)", letterSpacing: "-.02em", margin: "0 0 12px" }}>Start your 7-day journey.</h2>
          <p style={{ opacity: .92, maxWidth: 560, margin: "0 auto 22px", fontSize: 17 }}>Know your level within the week, follow a path built for you — and carry a QR-verifiable report employers can check.</p>
          <a href="/onboarding" style={{ background: "var(--bg-elevated)", color: "var(--accent-text)", padding: "14px 28px", borderRadius: 12, fontWeight: 800, display: "inline-block" }}>Start my 7-day trial →</a>
        </section>
      </main>
    </>
  );
}
