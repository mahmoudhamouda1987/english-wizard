import Link from "next/link";
import { ThemeToggle } from "@/app/components/theme-toggle";

const FEATURES = [
  { icon: "🧭", title: "Adaptive diagnostic", text: "A short placement check measures your real level across listening, speaking, reading, writing, grammar and vocabulary.", href: "/diagnostic", cta: "Take the diagnostic" },
  { icon: "📚", title: "Structured lessons", text: "28+ lessons across every CEFR level from Pre-A1 to C2 — each one explains why you are learning it.", href: "/learn", cta: "Open lessons" },
  { icon: "🎯", title: "Spaced review", text: "Mistakes become review cards scheduled by a spaced-repetition algorithm, so nothing slips away.", href: "/review", cta: "See review queue" },
  { icon: "👂", title: "English Ear training", text: "Train connected speech perception against formal spelling with real audio exercises.", href: "/english-ear", cta: "Train your ear" },
  { icon: "🎙️", title: "Say It Better", text: "Upgrade your speaking with structured variants from casual to professional registers.", href: "/say-it-better", cta: "Practice speaking" },
  { icon: "🌍", title: "Worlds & missions", text: "Quick quests, standard journeys, deep study and boss missions — pick the session that fits your day.", href: "/worlds", cta: "Explore worlds" },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <Link className="site-brand" href="/"><img src="/logo.png" alt="English Wizard logo" width={38} height={38} /> English Wizard</Link>
        <nav className="site-nav" aria-label="Site">
          <a href="/auth">Sign in</a>
          <a className="primary" href="/onboarding">Start learning</a>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main-content" style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px" }}>
        <section className="hero-band">
          <p style={{ fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", fontSize: 13, opacity: .85, margin: "0 0 12px" }}>Your personal English command center</p>
          <h1 style={{ fontSize: "clamp(36px, 6vw, 68px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-.02em" }}>
            Measure what you know.<br />Learn what you need next.
          </h1>
          <p style={{ maxWidth: 640, fontSize: 19, lineHeight: 1.6, opacity: .92, margin: "0 0 28px" }}>
            An adaptive platform that places you precisely on the CEFR scale, builds real evidence of progress, and keeps every lesson, mistake and mastery insight saved to your account.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/onboarding" style={{ background: "#fff", color: "#4626b8", padding: "14px 26px", borderRadius: 12, fontWeight: 800 }}>Start learning free →</a>
            <a href="/diagnostic" style={{ border: "1px solid rgba(255,255,255,.55)", color: "#fff", padding: "14px 26px", borderRadius: 12, fontWeight: 800 }}>Take the 5-minute diagnostic</a>
          </div>
        </section>
        <section className="feature-grid" aria-label="What is inside">
          {FEATURES.map((f) => (
            <a key={f.title} className="feature-card" href={f.href}>
              <span className="fc-icon" aria-hidden="true">{f.icon}</span>
              <strong style={{ fontSize: 16 }}>{f.title}</strong>
              <p>{f.text}</p>
              <span className="link-arrow">{f.cta} →</span>
            </a>
          ))}
        </section>
      </main>
    </>
  );
}
