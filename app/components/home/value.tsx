import Link from "next/link";
import Image from "next/image";
import { Reveal } from "./reveal";
import { entryPrice } from "@/src/domain/pricing";
import {
  IconBriefcase, IconPlane, IconGraduation, IconUsers, IconBuilding,
  IconCheck, IconDoc, IconShield, IconRoute, IconChart, IconSparkle,
  IconTarget, IconArrow,
} from "./icons";

/* ---------------- §16 Personalization engine ---------------- */

const ENGINE = [
  { t: "You", s: "start here" },
  { t: "LevelCheck", s: "30-minute adaptive assessment" },
  { t: "Your level", s: "precise CEFR placement" },
  { t: "Your skills", s: "profiled across four dimensions" },
  { t: "Your gaps", s: "named, not guessed" },
  { t: "Your path", s: "lessons aimed at the gaps" },
  { t: "Your practice", s: "review that follows you" },
  { t: "Your progress", s: "measured and proven" },
];

export function Personalization() {
  return (
    <section className="hp-section" aria-labelledby="hp-engine-title">
      <div className="hp-wrap">
        <Reveal className="hp-head hp-center">
          <span className="hp-eyebrow">Learning that adapts to you</span>
          <h2 id="hp-engine-title" className="hp-display hp-h2">Built around one person:<br />you.</h2>
          <p className="hp-lead">Your assessment is not the end of anything — it is the input that shapes everything that follows. No generic syllabus, no starting where you already are.</p>
        </Reveal>
        <Reveal delay={1}>
          <div className="hp-engine">
            {ENGINE.map((n, i) => (
              <div className="hp-engine-node" key={n.t}>
                <span className="n" aria-hidden="true">{i + 1}</span>
                <strong>{n.t}</strong>
                <small>{n.s}</small>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- §17 Learning path ---------------- */

const PATH_BARS = [
  { k: "Grammar", v: 80 }, { k: "Vocabulary", v: 90 }, { k: "Listening", v: 70 }, { k: "Speaking", v: 60 },
];
const PATH_STEPS = ["B2 Core", "Communication", "Fluency", "Advanced Listening", "C1 Preparation"];

export function LearningPath() {
  return (
    <section className="hp-section hp-band-paper" aria-labelledby="hp-path-title">
      <div className="hp-wrap-wide">
        <div className="hp-showcase" style={{ alignItems: "start" }}>
          <Reveal>
            <span className="hp-eyebrow">A path, not a pile of lessons</span>
            <h2 id="hp-path-title" className="hp-display hp-h2" style={{ margin: "14px 0 18px" }}>Aspirational,<br />and tangible.</h2>
            <p className="hp-lead">This is what an example learner at B2 sees after LevelCheck. Every bar is measured, every stop on the path has a reason.</p>
            <p className="hp-caption" style={{ marginTop: 14 }}>Example learner profile — your path is generated from your own assessment.</p>
          </Reveal>
          <Reveal delay={1}>
            <div className="hp-card" style={{ padding: "clamp(22px,3vw,34px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <strong style={{ fontSize: 15 }}>Current level · B2</strong>
                <span className="hp-caption">Skill profile</span>
              </div>
              <div style={{ display: "grid", gap: 13 }}>
                {PATH_BARS.map((b) => (
                  <div className="hp-cefr-sbar" key={b.k}>
                    <span>{b.k}</span>
                    <span className="track" role="img" aria-label={`${b.k} at ${b.v} percent`}><i style={{ width: `${b.v}%` }} /></span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--hp-line)", marginTop: 20, paddingTop: 18 }}>
                <strong style={{ fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--hp-brand)" }}>Recommended path</strong>
                <ol style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "grid", gap: 9 }}>
                  {PATH_STEPS.map((s, i) => (
                    <li key={s} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14.5 }}>
                      <span aria-hidden="true" style={{ width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center", background: "rgba(138,99,255,.12)", color: "var(--hp-brand)", fontWeight: 800, fontSize: 11.5, flex: "none" }}>{i + 1}</span>
                      {s}{i === PATH_STEPS.length - 1 && <IconArrow size={15} style={{ color: "var(--hp-gold)" }} />}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- §18 Real life ---------------- */

const LIFE = [
  { icon: IconBriefcase, t: "Work", s: "Meetings, emails, small talk with colleagues", tag: "Task: reschedule a deadline" },
  { icon: IconPlane, t: "Travel", s: "Airports, hotels, asking for help anywhere", tag: "Task: change a booking" },
  { icon: IconGraduation, t: "Study", s: "Lectures, essays, seminar discussion", tag: "Task: summarise a lecture" },
  { icon: IconUsers, t: "Conversation", s: "Friends, opinions, stories, humour", tag: "Task: tell a personal story" },
  { icon: IconTarget, t: "Interviews", s: "Answering under pressure, with structure", tag: "Task: describe your strengths" },
  { icon: IconChart, t: "Presentations", s: "Signposting, emphasis, handling questions", tag: "Task: open a presentation" },
  { icon: IconBuilding, t: "Academic life", s: "Applications, references, formal writing", tag: "Task: write a formal request" },
  { icon: IconRoute, t: "Real checkpoints", s: "Reality scenarios every few days", tag: "Task: order coffee, chase an email" },
];

export function RealLife() {
  return (
    <section className="hp-section" aria-labelledby="hp-life-title">
      <div className="hp-wrap">
        <Reveal className="hp-head hp-center">
          <span className="hp-eyebrow">Beyond the textbook</span>
          <h2 id="hp-life-title" className="hp-display hp-h2">English for real life.</h2>
          <p className="hp-lead">Lessons end. Situations do not. English Wizard practises the moments you will actually be in.</p>
        </Reveal>
        <div className="hp-life-grid">
          {LIFE.map((l, i) => (
            <Reveal key={l.t} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <article className="hp-life">
                <l.icon size={22} />
                <strong>{l.t}</strong>
                <p>{l.s}</p>
                <small>{l.tag}</small>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- §20 Progress story ---------------- */

const MONTHS = [
  { m: "January", lv: "B1", note: "Placement: solid intermediate" },
  { m: "February", lv: "B1+", note: "Grammar gaps closed" },
  { m: "March", lv: "B2", note: "Speaking confidence up" },
  { m: "April", lv: "B2+", note: "Listening at natural speed" },
  { m: "Goal", lv: "C1", note: "Professional working level", isC1: true },
];

export function ProgressStory() {
  return (
    <section className="hp-section hp-progress" aria-labelledby="hp-progress-title">
      <div className="hp-wrap" style={{ position: "relative" }}>
        <Reveal className="hp-head" style={{ marginBottom: "0" }}>
          <span className="hp-eyebrow">The proof section</span>
          <h2 id="hp-progress-title" className="hp-display hp-h2">Watch your English move.</h2>
          <p className="hp-lead" style={{ color: "rgba(233,236,255,.7)" }}>
            Every skill is re-measured as you practise. Here is what an example year can look like.
          </p>
        </Reveal>
        <div className="hp-months">
          {MONTHS.map((mo, i) => (
            <Reveal key={mo.m} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <article className={`hp-month${mo.isC1 ? " is-c1" : ""}`}>
                <small>{mo.m}</small>
                <span className="lv">{mo.lv} {mo.isC1 && <small>· target</small>}</span>
                <p>{mo.note}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="hp-spark">
          {[
            { k: "Listening", pts: "2,18 34,14 66,11 98,6" },
            { k: "Speaking", pts: "2,20 34,16 66,10 98,8" },
            { k: "Reading", pts: "2,15 34,12 66,9 98,5" },
            { k: "Writing", pts: "2,19 34,17 66,12 98,7" },
          ].map((s) => (
            <div className="hp-spark-col" key={s.k}>
              <svg viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
                <polyline points={s.pts} fill="none" stroke="#f6c667" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={`2,24 ${s.pts} 98,24`} fill="rgba(246,198,103,.12)" stroke="none" />
              </svg>
              <small>{s.k}</small>
            </div>
          ))}
        </div>
        <p className="hp-progress-note" style={{ marginTop: 26 }}>
          Example journey for illustration — your report is generated from your own verified activity.
        </p>
      </div>
    </section>
  );
}

/* ---------------- §21 Report / credential ---------------- */

export function ReportSection() {
  return (
    <section className="hp-section" aria-labelledby="hp-report-title">
      <div className="hp-wrap">
        <div className="hp-report">
          <Reveal>
            <div className="hp-report-doc" role="img" aria-label="Preview of an English Wizard LevelCheck assessment report">
              <div className="hp-report-head">
                <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <Image src="/logo.png" alt="" width={34} height={34} unoptimized />
                  <span><strong>LevelCheck Report</strong><small>English Wizard · CEFR-aligned assessment</small></span>
                </span>
                <span className="hp-report-qr" aria-hidden="true" />
              </div>
              <div className="hp-report-body">
                <div className="hp-report-row"><span>Student</span><b>Sara H.</b></div>
                <div className="hp-report-row"><span>Student ID</span><b>EW-2026-0417</b></div>
                <div className="hp-report-row"><span>Assessment date</span><b>29 Aug 2026</b></div>
                <div className="hp-report-row"><span>CEFR level</span><span className="hp-cefr-badge">B2</span></div>
                <div className="hp-report-mini">
                  {[["Listening", 74], ["Speaking", 68], ["Reading", 78], ["Writing", 70]].map(([k, v]) => (
                    <div key={k as string}>
                      {k}
                      <span className="track" aria-hidden="true"><i style={{ width: `${v}%` }} /></span>
                    </div>
                  ))}
                </div>
                <p className="hp-caption" style={{ margin: 0 }}>Verifiable via QR · signed report · downloadable PDF</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <span className="hp-eyebrow">Proof you can carry</span>
            <h2 id="hp-report-title" className="hp-display hp-h2" style={{ margin: "14px 0 22px" }}>Your English,<br />professionally documented.</h2>
            <div className="hp-points">
              <div className="hp-point"><IconDoc size={20} /><div><strong>A precise CEFR placement</strong><p>Mapped to real CEFR descriptors — what you can do, not just a percentage.</p></div></div>
              <div className="hp-point"><IconShield size={20} /><div><strong>Tamper-evident and verifiable</strong><p>Every report carries a QR code and signature an employer can check.</p></div></div>
              <div className="hp-point"><IconDoc size={20} /><div><strong>Downloadable PDF</strong><p>Attach it to applications, LinkedIn or your CV with confidence.</p></div></div>
              <div className="hp-point"><IconSparkle size={20} /><div><strong>An honest credential</strong><p>An English Wizard assessment report — clearly labelled, never dressed up as an official accreditation.</p></div></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- §22 Why + §25 Organizations ---------------- */

const GENERIC = ["One-size-fits-all syllabus", "A score with no explanation", "Progress measured in streaks", "Speaking: postponed indefinitely", "Certificates nobody can check"];
const EW = ["Placement before anything else", "Adaptive path aimed at your gaps", "All four skills, every week", "Speaking practice with recorded evidence", "QR-verifiable reports and certificates"];

export function WhyAndOrganizations() {
  return (
    <>
      <section className="hp-section hp-band-paper" aria-labelledby="hp-why-title">
        <div className="hp-wrap-wide">
          <Reveal className="hp-head hp-center">
            <span className="hp-eyebrow">The difference</span>
            <h2 id="hp-why-title" className="hp-display hp-h2">Why English Wizard?</h2>
          </Reveal>
          <Reveal>
            <div className="hp-why">
              <div className="hp-why-col hp-why-generic">
                <h3>Generic English platform<small>Learn a little of everything. Master none of it.</small></h3>
                {GENERIC.map((g) => (
                  <div className="hp-why-row" key={g}><IconDoc size={17} /> {g}</div>
                ))}
              </div>
              <div className="hp-why-vs" aria-hidden="true">VS</div>
              <div className="hp-why-col hp-why-ew">
                <h3>English Wizard<small>Know → Learn → Practise → Measure → Progress → Prove.</small></h3>
                {EW.map((e) => (
                  <div className="hp-why-row" key={e}><IconCheck size={17} /> {e}</div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="hp-section" id="organizations" aria-labelledby="hp-org-title">
        <div className="hp-wrap">
          <div className="hp-showcase" style={{ alignItems: "center" }}>
            <Reveal>
              <span className="hp-eyebrow">For organizations</span>
              <h2 id="hp-org-title" className="hp-display hp-h2" style={{ margin: "14px 0 18px" }}>English for people.<br />English for business.</h2>
              <p className="hp-lead">Companies, schools, institutions and training providers use English Wizard to place people accurately, develop them deliberately, and document the results professionally.</p>
              <div style={{ display: "grid", gap: 11, margin: "20px 0 26px" }}>
                {["Assessment and placement before training budgets are spent", "Employee development with visible, measured progress", "Professional reporting for teams and stakeholders"].map((t) => (
                  <span key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, color: "var(--hp-muted)" }}><IconCheck size={17} style={{ color: "var(--hp-green)", flex: "none", marginTop: 2 }} /> {t}</span>
                ))}
              </div>
              <Link className="hp-btn hp-btn-primary" href="/onboarding">For Organisations</Link>
            </Reveal>
            <Reveal delay={1}>
              <div className="hp-card" style={{ padding: "clamp(22px,3vw,34px)" }}>
                <strong style={{ display: "block", fontSize: 15, marginBottom: 16 }}>Use cases</strong>
                <div style={{ display: "grid", gap: 12 }}>
                  {[IconBuilding, IconUsers, IconGraduation, IconBriefcase].map((I, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 14, color: "var(--hp-muted)" }}>
                      <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(138,99,255,.12)", color: "var(--hp-brand)", flex: "none" }}><I size={18} /></span>
                      {["Companies", "Schools", "Institutions", "Training providers"][i]}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- §26 Pricing preview + §27 Trial + §28 Final CTA + §29 Footer ---------------- */


export function Conversion() {
  /* Part 83: simple entry pricing from the commercial configuration — no
   * free-forever claims. Region-aware; worldwide is the static default. */
  const entry = entryPrice("WW");
  return (
    <>
      <section className="hp-section" aria-labelledby="hp-pricing-title" id="pricing-preview">
        <div className="hp-wrap hp-center">
          <Reveal className="hp-head hp-center">
            <span className="hp-eyebrow">One price per product</span>
            <h2 id="hp-pricing-title" className="hp-display hp-h2">Start your 7-day journey.<br />Then choose your path.</h2>
            <p className="hp-lead" style={{ color: "rgba(233,236,255,.7)" }}>
              Every new learner begins with a full 7-day trial. After that, one subscription per product —
              or All Access for the complete ecosystem.
            </p>
          </Reveal>
          <Reveal className="hp-center" style={{ marginTop: 8 }}>
            <div className="hp-entry-price" style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "baseline", justifyContent: "center", gap: 12, padding: "18px 28px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)" }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>{entry.product}</span>
              <span style={{ fontSize: 13, opacity: .75 }}>from</span>
              <strong style={{ fontSize: 30, letterSpacing: "-.02em" }}>{entry.price}</strong>
            </div>
          </Reveal>
          <Reveal className="hp-center" style={{ marginTop: 26 }}>
            <Link className="hp-btn hp-btn-gold" href="/pricing">Explore plans</Link>
          </Reveal>
        </div>
      </section>

      <section className="hp-section hp-trial" aria-labelledby="hp-trial-title">
        <div className="hp-wrap" style={{ position: "relative" }}>
          <Reveal className="hp-head">
            <span className="hp-eyebrow">Seven days, guided</span>
            <h2 id="hp-trial-title" className="hp-display hp-h2">Start your 7-day English journey.</h2>
            <p className="hp-lead" style={{ color: "rgba(233,236,255,.7)" }}>A trial should not be a timer. It should be a guided week that ends with you knowing exactly what to do next.</p>
          </Reveal>
          <div className="hp-days">
            {[["1", "Discover"], ["2", "Learn"], ["3", "Practise"], ["4", "Speak"], ["5", "Improve"], ["6", "Measure"], ["7", "Plan"]].map(([d, t], i) => (
              <Reveal key={d} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="hp-day"><i aria-hidden="true">{d}</i><strong>{t}</strong></div>
              </Reveal>
            ))}
          </div>
          <Reveal className="hp-center" style={{ marginTop: 40 }}>
            <Link className="hp-btn hp-btn-gold" href="/onboarding">Start Free Trial</Link>
          </Reveal>
        </div>
      </section>

      <section className="hp-section hp-final" aria-labelledby="hp-final-title">
        <div className="hp-wrap">
          <Reveal>
            <span className="hp-eyebrow" style={{ justifyContent: "center", display: "inline-flex" }}>The honest starting point</span>
            <h2 id="hp-final-title" className="hp-display hp-h1" style={{ fontSize: "clamp(34px,4.6vw,62px)", margin: "18px auto", maxWidth: 900 }}>
              Your English journey starts with knowing where you stand.
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <div className="hp-final-path" aria-label="CEFR path from Pre-A1 to C2">
              {["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].map((r, i) => (
                <span key={r} className={`hp-path-item${i === 6 ? " is-c2" : ""}`} style={i === 6 ? undefined : {}}>
                  {r !== "Pre-A1" && i > 0 && <span className="arrow" aria-hidden="true" style={{ marginRight: 10 }}>→</span>}
                  {r}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={2}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link className="hp-btn hp-btn-primary" href="/diagnostic">Discover My Level</Link>
              <Link className="hp-btn hp-btn-ghost" href="/plan" style={{ color: "var(--hp-text)" }}>Explore English Wizard</Link>
            </div>
            <p className="hp-hero-micro" style={{ textAlign: "center", color: "var(--hp-faint)" }}>Adaptive placement &bull; Pre-A1 to C2 &bull; About 30 minutes</p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ---------------- §29 Footer ---------------- */

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="hp-footer">
      <div className="hp-footer-inner">
        <div>
          <strong className="brand"><Image src="/logo.png" alt="" width={30} height={30} unoptimized /> English Wizard</strong>
          <p>Evidence-based English learning on the CEFR scale. Measure where you stand, learn what you need, and prove how far you have come.</p>
        </div>
        <div>
          <h4>Learn</h4>
          <nav aria-label="Footer — learn">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/plan">Learning path</Link>
            <Link href="/cambridge/course">Cambridge pathway</Link>
            <Link href="/ielts/course">IELTS pathway</Link>
          </nav>
        </div>
        <div>
          <h4>Product</h4>
          <nav aria-label="Footer — product">
            <Link href="/diagnostic">LevelCheck</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/report">Reports</Link>
            <Link href="/onboarding">Start free</Link>
          </nav>
        </div>
        <div>
          <h4>Company</h4>
          <nav aria-label="Footer — company">
            <Link href="/#organizations">For Organisations</Link>
            <Link href="/auth">Sign in</Link>
            <Link href="/pricing">Contact</Link>
          </nav>
        </div>
      </div>
      <div className="hp-footer-bottom">
        <span>© {year} English Wizard · CEFR-aligned learning, Pre-A1 → C2</span>
        <span>English Wizard assessment reports are CEFR-aligned — not an official accreditation.</span>
      </div>
    </footer>
  );
}
