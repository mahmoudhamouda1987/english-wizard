import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";

export const metadata: Metadata = {
  title: "Discover Your English Level — English Wizard",
  description: "Discover where you stand on the CEFR scale with an adaptive English assessment, then learn with an AI tutor and earn verifiable progress reports.",
};

const PROOF_POINTS = [
  { icon: "⏳", title: "Hear yourself improve", text: "Record the same sentence today and in three months — then play your past self beside your present self. Progress you can hear, not a score in a game.", href: "/onboarding", cta: "Try it" },
  { icon: "🎖️", title: "A certificate employers can verify", text: "Every certificate carries a QR code and tamper-evident signature mapped to real CEFR descriptors. Put it on LinkedIn with confidence.", href: "/pricing", cta: "See how" },
  { icon: "🗂️", title: "A portfolio, not points", text: "Your emails, essays and recorded speech build into a body of work over time — proof you can point to and say “I could not do this before.”", href: "/onboarding", cta: "Start yours" },
  { icon: "🧠", title: "A tutor who remembers you", text: "Our AI teacher tracks your recurring mistakes for months, weaves them into lessons, and never resets context between sessions.", href: "/onboarding", cta: "Meet your tutor" },
  { icon: "🔍", title: "Grading with no black box", text: "When something is scored, you see exactly which criterion, which error, why. Same rules for everyone, always visible.", href: "/onboarding", cta: "See it" },
  { icon: "🌍", title: "Practice for real life", text: "Reality checkpoints every few days: order coffee, chase an email, handle a difficult meeting — the English you actually need.", href: "/onboarding", cta: "First challenge" },
];

const STEPS = [
  { n: "1", title: "Discover your level", text: "Place yourself precisely on the CEFR scale — Pre-A1 to C2 — with an adaptive assessment that adapts to your answers." },
  { n: "2", title: "Learn what you need next", text: "Lessons chosen from evidence, not a fixed checklist. Every mistake becomes a spaced-review card; every win becomes evidence." },
  { n: "3", title: "Prove it to yourself", text: "Compare recordings across months, collect real work in your portfolio, pass reality checkpoints, earn verifiable certificates." },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link className="site-brand" href="/"><Image src="/logo.png" alt="English Wizard logo" width={38} height={38} unoptimized /> English Wizard</Link>
        <nav className="site-nav" aria-label="Site">
          <Link href="/#how">How it works</Link>
          <a href="/pricing">Pricing</a>
          <a href="/auth">Sign in</a>
          <a className="primary" href="/onboarding">Start free</a>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main-content">
        <section className="hero-band" style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 13, opacity: .85, margin: "0 0 12px" }}>The honest English platform</p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 66px)", lineHeight: 1.05, margin: "0 auto 18px", letterSpacing: "-.02em", maxWidth: 820 }}>
            Know your English level.<br />Then prove your progress.
          </h1>
          <p style={{ maxWidth: 640, fontSize: 19, lineHeight: 1.6, opacity: .92, margin: "0 auto 28px" }}>
            Discover where you stand on the CEFR scale — Pre-A1 to C2 — with an adaptive assessment that adapts to your answers. Then learn with an AI tutor that remembers your mistakes, and earn verifiable reports.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/diagnostic" style={{ background: "#fff", color: "#4626b8", padding: "15px 30px", borderRadius: 12, fontWeight: 800, boxShadow: "0 10px 26px rgba(255,255,255,.18)" }}>Discover My English Level →</a>
            <a href="/onboarding" style={{ border: "1px solid rgba(255,255,255,.55)", color: "#fff", padding: "15px 30px", borderRadius: 12, fontWeight: 800 }}>Explore English Wizard</a>
          </div>
        </section>

        <section id="how" aria-label="How it works" style={{ maxWidth: 1100, margin: "56px auto 0", padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 }}>
            {STEPS.map((s) => (
              <div key={s.n} className="panel" style={{ margin: 0, padding: 24 }}>
                <span style={{ display: "inline-grid", placeItems: "center", width: 38, height: 38, borderRadius: 999, background: "#efeafd", color: "#4626b8", fontWeight: 800 }}>{s.n}</span>
                <strong style={{ display: "block", fontSize: 17, margin: "10px 0 6px" }}>{s.title}</strong>
                <p className="subtle" style={{ lineHeight: 1.7, margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "64px auto 0", padding: "0 24px" }}>
          <h2 style={{ fontSize: "clamp(26px,4vw,36px)", letterSpacing: "-.02em", textAlign: "center", margin: "0 0 8px" }}>Progress you can point to</h2>
          <p className="subtle" style={{ textAlign: "center", marginBottom: 30 }}>Streaks feel good. These change lives.</p>
          <div className="feature-grid" style={{ paddingTop: 0 }}>
            {PROOF_POINTS.map((f) => (
              <a key={f.title} className="feature-card" href={f.href}>
                <span className="fc-icon" aria-hidden="true">{f.icon}</span>
                <strong style={{ fontSize: 16 }}>{f.title}</strong>
                <p>{f.text}</p>
                <span className="link-arrow">{f.cta} →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="hero-band" style={{ marginTop: 72, textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", letterSpacing: "-.02em", margin: "0 0 12px" }}>Free where it counts.</h2>
          <p style={{ opacity: .92, fontSize: 17, maxWidth: 560, margin: "0 auto 22px" }}>
            The full curriculum, review engine, portfolio and checkpoints are unlimited and free forever. Upgrade only when you want more AI practice.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <a href="/onboarding" style={{ background: "#fff", color: "#4626b8", padding: "14px 28px", borderRadius: 12, fontWeight: 800 }}>Start learning free →</a>
            <a href="/pricing" style={{ border: "1px solid rgba(255,255,255,.55)", color: "#fff", padding: "14px 28px", borderRadius: 12, fontWeight: 800 }}>See pricing</a>
          </div>
        </section>
      </main>
      <footer style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 48px" }}>
        <p className="subtle" style={{ fontSize: 13 }}>© {new Date().getFullYear()} English Wizard · Evidence-based learning on the CEFR scale · <a href="/pricing" style={{ textDecoration: "underline" }}>Pricing</a></p>
      </footer>
    </>
  );
}
