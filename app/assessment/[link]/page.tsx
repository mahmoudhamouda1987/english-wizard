import { query } from "@/src/infrastructure/database";
import Link from "next/link";

export const dynamic = "force-dynamic";

/**
 * Candidate assessment link page (2.0 contract, Parts 94–95).
 *
 * Public, token-addressed page behind the candidateLink returned by the B2B
 * API: /assessment/<linkToken>. The token grants access to exactly one
 * assessment — no other data is reachable. Architecture-first phase: the page
 * reports the real status of the assessment and, once completed, the real
 * result with its verifiable report ID. It never fakes a "start" action that
 * does not capture a result (Definition of Done: no fake functionality).
 */

interface AssessmentRow {
  id: string;
  label: string;
  system: string;
  status: string;
  created_at: Date;
}

interface ResultRow {
  candidate_ref: string;
  cefr_level: string;
  skill_profile: Record<string, { level: string; percent: number }>;
  percent: number;
  report_id: string;
  created_at: Date;
}

const SYSTEM_LABEL: Record<string, string> = {
  LEVELCHECK: "LevelCheck placement assessment",
  IELTS: "IELTS practice assessment",
  CAMBRIDGE: "Cambridge practice assessment",
};

export default async function CandidateAssessmentPage({ params }: { params: Promise<{ link: string }> }) {
  const { link } = await params;

  let assessment: AssessmentRow | null = null;
  let result: ResultRow | null = null;
  let lookupError = false;

  if (link && link.length >= 10) {
    try {
      const rows = await query<AssessmentRow>(
        "SELECT id, label, system, status, created_at FROM b2b_assessments WHERE link_token=$1 LIMIT 1",
        [link],
      );
      assessment = rows.rows[0] ?? null;
      if (assessment) {
        const res = await query<ResultRow>(
          "SELECT candidate_ref, cefr_level, skill_profile, percent, report_id, created_at FROM b2b_results WHERE assessment_id=$1 ORDER BY created_at DESC LIMIT 1",
          [assessment.id],
        );
        result = res.rows[0] ?? null;
      }
    } catch {
      lookupError = true;
    }
  }

  return (
    <main id="main-content" style={{ minHeight: "100vh", background: "var(--bg-muted)", padding: "48px 20px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <p className="eyebrow">English Wizard · Assessment link</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(24px, 3vw, 32px)", margin: "6px 0 4px" }}>
          Your assessment
        </h1>
        <p className="subtle" style={{ marginBottom: 22 }}>
          This link was issued to you by an organisation using English Wizard&apos;s assessment service.
        </p>

        {lookupError ? (
          <div className="state-card error" role="alert">
            Verification service unavailable. Please try again shortly.
          </div>
        ) : !assessment ? (
          <div className="state-card" role="status">
            <strong>No matching record.</strong> This assessment link is not recognised. Check the link exactly as it was
            sent to you — it is case-sensitive and works for one assessment only.
          </div>
        ) : result ? (
          <>
            <section className="panel" style={{ padding: 24, marginBottom: 16 }}>
              <p className="eyebrow">Completed</p>
              <h2 style={{ margin: "4px 0 10px" }}>{assessment.label}</h2>
              <p className="subtle" style={{ marginBottom: 16 }}>{SYSTEM_LABEL[assessment.system] ?? assessment.system}</p>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, color: "var(--accent)" }}>
                  {result.cefr_level}
                </span>
                <span className="pill">{result.percent}% overall</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 6px", display: "grid", gap: 8 }}>
                {Object.entries(result.skill_profile ?? {}).map(([skill, v]) => (
                  <li key={skill} style={{ display: "grid", gap: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{skill} · {v.level} ({v.percent}%)</span>
                    <span className="mini-track" aria-hidden="true"><span style={{ width: `${Math.max(0, Math.min(100, v.percent))}%` }} /></span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="panel" style={{ padding: 24 }}>
              <p className="eyebrow">Verification</p>
              <p className="subtle" style={{ margin: "8px 0 12px" }}>
                Your organisation received this report with verification reference{" "}
                <strong style={{ fontFamily: "var(--font-mono)", letterSpacing: ".04em" }}>{result.report_id}</strong>.
                Anyone holding the reference can confirm it on the public verification service — no personal data is shown.
              </p>
              <Link className="button" href={`/verification?ref=${encodeURIComponent(result.report_id)}`}>
                Verify this report
              </Link>
            </section>
          </>
        ) : (
          <section className="panel" style={{ padding: 24 }}>
            <p className="eyebrow">Waiting for completion</p>
            <h2 style={{ margin: "4px 0 10px" }}>{assessment.label}</h2>
            <p className="subtle" style={{ marginBottom: 16 }}>
              {SYSTEM_LABEL[assessment.system] ?? assessment.system} · issued{" "}
              {new Date(assessment.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            <p style={{ lineHeight: 1.65 }}>
              This assessment has been created but not yet completed. When it is completed, your organisation receives the
              report with a verification reference, and the result appears on this page.
            </p>
            <p className="subtle" style={{ marginTop: 14 }}>
              Keep this link private — it is addressed to you alone.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
