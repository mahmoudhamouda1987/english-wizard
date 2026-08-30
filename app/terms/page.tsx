import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/app/components/theme-toggle";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms that govern your use of English Wizard — accounts, subscriptions, assessments and acceptable use.",
};

const SECTIONS: { h: string; body: string[] }[] = [
  {
    h: "The service",
    body: [
      "English Wizard provides personalised English learning, practice and assessment on the CEFR scale, from Pre-A1 to C2. The service includes General English, Business English, Fluency Track, IELTS Preparation, Cambridge Preparation, LevelCheck assessment and professional reports.",
      "We improve the product continuously. Features, content and the interface may change as the platform develops; material reductions to paid features will be announced in advance.",
    ],
  },
  {
    h: "Accounts",
    body: [
      "You need an account to learn and to keep assessment evidence. You are responsible for the accuracy of your details, for keeping your password safe, and for activity carried out through your account. One account per learner; sharing an account between learners makes accurate measurement impossible and is not permitted.",
      "If you are under the age of digital consent in your country, a parent, guardian or school creates and controls your account.",
    ],
  },
  {
    h: "Assessments and reports",
    body: [
      "LevelCheck is an adaptive placement assessment aligned to the CEFR. It produces a placement estimate and a professional report — it is not an official accreditation, a Cambridge Assessment English product, or an IELTS score, and reports are labelled accordingly.",
      "IELTS and Cambridge scale estimates produced anywhere in the platform are English Wizard calculations on original practice material, never official results.",
      "Report verification references exist so a third party can confirm that a report is authentic and unaltered.",
    ],
  },
  {
    h: "Subscriptions, trials and billing",
    body: [
      "Each product is a single subscription with a 7-day free trial; All Access covers every product. Prices are shown in your local currency where supported. The trial converts to a paid subscription unless cancelled before it ends, and you can cancel at any time — access continues to the end of the paid period.",
      "Organisation plans are governed by the agreement signed with that organisation, which takes precedence over this section for its learners.",
    ],
  },
  {
    h: "Acceptable use",
    body: [
      "Do not misuse the platform: no automated scraping, no attempting to bypass level gates or entitlements, no disrupting the service, and no uploading unlawful content or content you do not have the rights to — for example, recordings or texts that belong to someone else.",
      "Assessment attempts must be your own work. Sitting LevelCheck with help from another person or a tool defeats its purpose and invalidates the result; we may mark affected reports accordingly.",
    ],
  },
  {
    h: "Your content",
    body: [
      "Your practice submissions, recordings and writing remain yours. You grant English Wizard the limited licence needed to process, score and store them to operate the service — for example, evaluating a recording and showing it back to you in your progress history.",
    ],
  },
  {
    h: "Liability",
    body: [
      "The service is provided with reasonable skill and care, but we do not guarantee specific outcomes — no service can guarantee a particular grade, band or fluency result, and we do not claim to. To the extent permitted by law, English Wizard is not liable for indirect or consequential losses arising from use of the service.",
    ],
  },
  {
    h: "Changes and contact",
    body: [
      "We may update these terms; material changes will be announced to account holders in advance. Continuing to use the service after a change takes effect means you accept the updated terms.",
      "Questions about these terms can be sent through the contact channel on our pricing page.",
    ],
  },
];

export default function TermsPage() {
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
        <h1 style={{ fontSize: "clamp(28px,4vw,40px)", margin: "4px 0 8px" }}>Terms</h1>
        <p className="subtle" style={{ margin: "0 0 30px" }}>
          The agreement between you and English Wizard — written to be read, not just accepted.
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
