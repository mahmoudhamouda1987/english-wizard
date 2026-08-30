import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How English Wizard handles your data — what we collect, why we collect it, and the controls you have.",
};

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "What we collect",
    body: [
      "Account basics: your name, email address and password (stored only as a salted hash). If you sign up through an organisation link, we also record which organisation invited you.",
      "Learning data: your LevelCheck results, lesson activity, practice submissions, speaking recordings you choose to make, and progress statistics. This is the data the platform uses to personalise your path and measure your progress.",
      "Technical data: standard request logs (IP address, browser type) kept briefly for security and reliability, and theme/interface preferences stored on your device.",
    ],
  },
  {
    h: "Why we use it",
    body: [
      "To run the service: placing you on the CEFR scale, building your learning path, scoring practice, and producing your assessment reports.",
      "To keep your account secure and to detect abuse or misuse of the platform.",
      "To communicate service messages — assessment readiness, report availability, subscription status. We do not sell your data, and we do not send marketing you have not asked for.",
    ],
  },
  {
    h: "AI processing",
    body: [
      "Some practice features (speaking feedback, writing evaluation) use AI models to assess your work against visible criteria. Submissions sent for AI evaluation are processed by our model providers under data-processing agreements and are not used to train public models.",
      "Objective exercises, LevelCheck scoring and report generation are computed by our own systems without third-party AI processing.",
    ],
  },
  {
    h: "Your reports and evidence",
    body: [
      "Assessment reports contain your level, skill profile and candidate identifiers. You choose whether to share them. Verification references let a third party confirm a report's authenticity without revealing your other data.",
      "Organisations that invited you can see the assessment results relevant to their programme — placement level, progress and completion. They cannot see your private notes or payment details.",
    ],
  },
  {
    h: "Retention and deletion",
    body: [
      "Learning data is kept while your account is active so your history, spaced-review schedule and progress evidence remain intact. You can delete your account from Settings, which removes your personal data within 30 days, except records we must keep for accounting or legal reasons.",
    ],
  },
  {
    h: "Your rights",
    body: [
      "You can access, correct, export or delete your personal data at any time from Settings, or by contacting us. Where European data-protection law applies, you also have the right to object to processing and to lodge a complaint with your supervisory authority.",
    ],
  },
  {
    h: "Children",
    body: [
      "English Wizard is suitable for learners of school age, and Pre-A1 content serves young beginners. Where a learner is under the age of digital consent in their country, an account is created through a parent, guardian or school, and that adult controls the account settings.",
    ],
  },
  {
    h: "Changes",
    body: [
      "If this policy changes materially, we will notify account holders by email before the change takes effect. The date below is the version date.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <header className="site-header">
        <Link className="site-brand" href="/"><Image src="/logo.png" alt="English Wizard logo" width={38} height={38} unoptimized /> English Wizard</Link>
        <nav className="site-nav" aria-label="Site">
          <Link href="/pricing">Pricing</Link>
          <a className="primary" href="/onboarding">Start learning</a>
          <ThemeToggle />
        </nav>
      </header>
      <main id="main-content" style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p className="eyebrow">English Wizard · Legal</p>
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", margin: "4px 0 8px" }}>Privacy</h1>
        <p className="subtle" style={{ margin: "0 0 30px" }}>
          Intelligent English. Measurable Progress. — and honest data practices behind both.
        </p>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", margin: "0 0 26px" }}>
          Version: 31 August 2026 · Applies to English Wizard on the web and all English Wizard products.
        </p>
        {SECTIONS.map((s) => (
          <section key={s.h} style={{ marginBottom: 26 }}>
            <h2 style={{ fontSize: 19, margin: "0 0 10px" }}>{s.h}</h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.75, margin: "0 0 10px" }}>{p}</p>
            ))}
          </section>
        ))}
      </main>
    </>
  );
}
