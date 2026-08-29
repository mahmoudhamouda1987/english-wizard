import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { CEFR_ORDER } from "@/src/domain/levelquest";
import {
  buildPlacementReportDoc,
  METHODOLOGY_TEXT,
  INCOMPLETE_MESSAGE,
  type PlacementReportDoc,
} from "@/src/domain/placement-report";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "English Proficiency Placement Report — English Wizard",
  description: "Your CEFR-aligned English proficiency placement report.",
};

interface ReportRow {
  id: string;
  level: string;
  confidence: string;
  variant: number;
  skill_profile: Record<string, string>;
  report_json: {
    skillScores?: Record<string, number>;
    skillAnswered?: Record<string, number>;
    boundary?: string | null;
    skillLowEvidence?: string[];
    answeredCount?: number;
    presentedCount?: number;
    speakingSubmitted?: boolean;
    speakingResponses?: number;
  };
  created_at: Date;
  display_name: string;
  student_id: string | null;
  duration_seconds: string | number | null;
}

const ACCENT = "#6840d6";
const NAVY = "#0f1535";
const INK = "#1c2233";
const MUTED = "#6a7080";
const FAINT = "#98a0ae";
const HAIR = "#d9dce4";

export default async function ReportPage() {
  const user = await currentUser();
  if (!user) redirect(`/auth?next=/report`);

  const r = await query<ReportRow>(
    `SELECT pr.id, pr.level, pr.confidence, pr.variant, pr.skill_profile, pr.report_json, pr.created_at,
            COALESCE(ua.display_name, lp.display_name) AS display_name, l.student_id,
            sess.duration_seconds
     FROM placement_reports pr
     JOIN learners l ON l.id = pr.learner_id
     LEFT JOIN user_accounts ua ON ua.learner_id = l.id
     LEFT JOIN learner_profiles lp ON lp.learner_id = l.id
     LEFT JOIN LATERAL (
       SELECT EXTRACT(EPOCH FROM (s.completed_at - s.started_at))::bigint AS duration_seconds
       FROM levelquest_sessions s
       WHERE s.learner_id = pr.learner_id AND s.status = 'COMPLETE' AND s.completed_at IS NOT NULL
       ORDER BY s.completed_at DESC LIMIT 1
     ) sess ON TRUE
     WHERE pr.learner_id = $1::uuid
     ORDER BY pr.created_at DESC LIMIT 1`,
    [user.learnerId],
  );
  if (!r.rowCount || !r.rows[0]) redirect("/diagnostic");

  const row = r.rows[0];
  const j = row.report_json ?? {};
  const doc: PlacementReportDoc = buildPlacementReportDoc({
    reportId: row.id,
    level: row.level ?? null,
    confidence: row.confidence ?? null,
    boundary: j.boundary ?? null,
    skillProfile: row.skill_profile ?? {},
    skillScores: j.skillScores ?? {},
    skillAnswered: j.skillAnswered ?? {},
    answeredCount: j.answeredCount ?? null,
    presentedCount: j.presentedCount ?? null,
    speakingSubmitted: Boolean(j.speakingSubmitted),
    speakingResponses: j.speakingResponses ?? 0,
    speakingBand: (j as { speakingBand?: string | null }).speakingBand ?? null,
    displayName: row.display_name,
    studentId: row.student_id,
    createdAt: row.created_at,
    durationSeconds: row.duration_seconds != null ? Number(row.duration_seconds) : null,
    lowEvidenceSkills: j.skillLowEvidence ?? [],
  });

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 56px" }}>
      <div style={{ borderTop: `3px solid ${ACCENT}`, marginTop: 0 }} />
      {/* ── Institutional header: organisation left · document right ── */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, padding: "26px 0 20px", borderBottom: `1px solid ${HAIR}`, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
          <Image src="/logo.png" alt="English Wizard logo" width={44} height={44} style={{ borderRadius: 10 }} unoptimized />
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: NAVY, letterSpacing: ".02em" }}>ENGLISH WIZARD</div>
            <div style={{ fontSize: 11.5, color: MUTED }}>Personalised English Learning</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: ".1em" }}>ASSESSMENT REPORT</div>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: NAVY, lineHeight: 1.25, marginTop: 2 }}>ENGLISH PROFICIENCY<br />PLACEMENT REPORT</div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: ACCENT, letterSpacing: ".06em", marginTop: 3 }}>CEFR-ALIGNED ASSESSMENT</div>
        </div>
      </header>

      {/* ── Document heading ── */}
      <h1 style={{ fontSize: 21, fontWeight: 800, color: NAVY, letterSpacing: ".02em", margin: "26px 0 4px" }}>
        ENGLISH PROFICIENCY PLACEMENT REPORT
      </h1>
      <div style={{ height: 2, background: NAVY, width: "100%", maxWidth: 260, marginBottom: 22 }} />

      {/* ── Candidate metadata ── */}
      <section aria-label="Candidate information" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px 24px", paddingBottom: 22, borderBottom: `1px solid ${HAIR}` }}>
        {[
          ["CANDIDATE", doc.candidate],
          ["STUDENT ID", doc.studentId],
          ["ASSESSMENT DATE", doc.dateLong],
          ["REPORT ID", doc.reportRef],
          ["ASSESSMENT METHOD", doc.method],
        ].map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: MUTED }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: INK, marginTop: 3 }}>{value}</div>
          </div>
        ))}
      </section>

      {doc.status === "INCOMPLETE" ? (
        <>
          <section aria-label="Assessment status" style={{ margin: "26px 0", border: `1px solid ${HAIR}`, borderLeft: `4px solid ${NAVY}`, borderRadius: 10, background: "#fbfbfe", padding: "22px 24px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: MUTED }}>STATUS</div>
            <p style={{ margin: "8px 0 6px", fontSize: 15, color: INK, lineHeight: 1.6 }}>{INCOMPLETE_MESSAGE}</p>
            <p style={{ margin: 0, fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
              This document is not a placement result. Levels appear only once valid assessment responses have been recorded.
            </p>
          </section>
          <section aria-label="Assessment methodology" style={{ marginTop: 26 }}>
            <SectionTitle>ASSESSMENT METHODOLOGY</SectionTitle>
            <p style={{ margin: 0, fontSize: 13.5, color: INK, lineHeight: 1.75 }}>{METHODOLOGY_TEXT}</p>
          </section>
          <div style={{ marginTop: 28 }}>
            <a href="/diagnostic" className="button" style={{ padding: "13px 24px" }}>Complete the assessment →</a>
          </div>
        </>
      ) : (
        <>
          {/* ── Overall result ── */}
          <section aria-label="Overall English proficiency" style={{ margin: "26px 0", border: `1px solid ${HAIR}`, borderLeft: `4px solid ${ACCENT}`, borderRadius: 10, background: "#fbfbfe", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div>
              <SectionTitle>OVERALL ENGLISH PROFICIENCY</SectionTitle>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
                <span style={{ fontSize: 64, fontWeight: 800, color: ACCENT, lineHeight: 1 }}>{doc.result!.level}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: NAVY, letterSpacing: ".06em" }}>{doc.result!.name}</span>
              </div>
              <div style={{ fontSize: 12.5, color: MUTED, marginTop: 8 }}>
                Confidence: <strong style={{ color: INK }}>{doc.result!.confidence}</strong>
                {doc.result!.boundary ? <> · Boundary placement: <strong style={{ color: INK }}>{doc.result!.boundary}</strong></> : null}
              </div>
            </div>
          </section>

          {/* ── Assessment summary ── */}
          <section aria-label="Assessment summary" style={{ margin: "22px 0 26px" }}>
            <SectionTitle>ASSESSMENT SUMMARY</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
              {doc.stats.map((st) => (
                <div key={st.label}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", color: MUTED }}>{st.label.toUpperCase()}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: INK, marginTop: 2 }}>{st.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CEFR scale ── */}
          <section aria-label="CEFR proficiency scale" style={{ margin: "26px 0" }}>
            <SectionTitle>CEFR PROFICIENCY SCALE</SectionTitle>
            <p style={{ margin: "0 0 18px", fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>
              The Common European Framework of Reference for Languages (CEFR) provides a structured, internationally recognised framework for describing language proficiency.
            </p>
            {/* Dedicated graphic zone: scale row + reserved marker row — nothing overlaps */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {CEFR_ORDER.map((lv) => {
                const placed = lv === doc.result!.level;
                return (
                  <div key={lv} style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: placed ? ACCENT : "#eef0f6", color: placed ? "white" : NAVY, fontWeight: 800, fontSize: 12.5 }}>
                    {lv}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, height: 40, marginTop: 6 }}>
              {CEFR_ORDER.map((lv, i) => (
                <div key={lv} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
                  {i === doc.cefrIndex ? (
                    <>
                      <span aria-hidden style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `6px solid ${ACCENT}` }} />
                      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".08em", color: ACCENT, marginTop: 4 }}>CURRENT LEVEL</span>
                    </>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* ── Skill profile ── */}
          <section aria-label="Skill profile" style={{ margin: "26px 0" }}>
            <SectionTitle>SKILL PROFILE</SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
              <thead>
                <tr style={{ background: "#eef0f6", color: NAVY, textAlign: "left" }}>
                  <th style={cellHead("16%")}>Skill</th>
                  <th style={cellHead("18%")}>CEFR Level</th>
                  <th style={cellHead("12%")}>Score</th>
                  <th style={cellHead("54%")}>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {doc.skills.map((s, i) => (
                  <tr key={s.skill} style={{ background: i % 2 ? "#fafbfd" : "white", borderBottom: `1px solid ${HAIR}` }}>
                    <td style={cell()}><strong style={{ color: INK }}>{s.label}</strong></td>
                    <td style={cell()}>{s.assessed ? <strong style={{ color: ACCENT }}>{s.level}</strong> : <span style={{ color: FAINT }}>Not assessed</span>}</td>
                    <td style={cell()}>{s.assessed ? (s.score != null ? `${s.score}%` : "—") : <span style={{ color: FAINT }}>—</span>}</td>
                    <td style={{ ...cell(), fontSize: 12.5, color: s.assessed ? MUTED : FAINT }}>{s.evidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {doc.skills.some((s) => s.lowEvidence) && (
              <p style={{ margin: "10px 0 0", fontSize: 11.5, color: FAINT }}>* Band based on limited questions in this sitting — it may firm up as practice continues.</p>
            )}
          </section>

          {/* ── What this level means ── */}
          <section aria-label="What this level means" style={{ margin: "26px 0" }}>
            <SectionTitle>WHAT THIS LEVEL MEANS</SectionTitle>
            <p style={{ margin: 0, fontSize: 13.5, color: INK, lineHeight: 1.75 }}>{doc.result!.meaning}</p>
          </section>

          {/* ── Strengths / priorities ── */}
          <section aria-label="Strengths and development priorities" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, margin: "26px 0" }}>
            <div style={{ border: `1px solid ${HAIR}`, borderRadius: 10, padding: "18px 20px" }}>
              <SectionTitle>STRENGTHS</SectionTitle>
              <p style={{ margin: "0 0 10px", fontSize: 11.5, color: FAINT }}>{doc.strengthsNote}</p>
              {doc.strengths.map((s) => (
                <div key={s.label} style={{ fontSize: 13.5, color: INK, padding: "3px 0" }}>• {s.label} — {s.score}% across {s.questions} question{s.questions === 1 ? "" : "s"}</div>
              ))}
            </div>
            <div style={{ border: `1px solid ${HAIR}`, borderRadius: 10, padding: "18px 20px" }}>
              <SectionTitle>DEVELOPMENT PRIORITIES</SectionTitle>
              <p style={{ margin: "0 0 10px", fontSize: 11.5, color: FAINT }}>{doc.prioritiesNote}</p>
              {doc.priorities.map((s) => (
                <div key={s.label} style={{ fontSize: 13.5, color: INK, padding: "3px 0" }}>• {s.label} — {s.score}% across {s.questions} question{s.questions === 1 ? "" : "s"}</div>
              ))}
            </div>
          </section>

          {/* ── Recommended starting point ── */}
          <section aria-label="Recommended starting point" style={{ margin: "26px 0" }}>
            <SectionTitle>RECOMMENDED STARTING POINT</SectionTitle>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: NAVY, margin: "6px 0 14px" }}>{doc.programme}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ background: ACCENT, color: "white", borderRadius: 8, padding: "10px 22px", textAlign: "center" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em", opacity: .85 }}>CURRENT LEVEL</div>
                <div style={{ fontSize: 21, fontWeight: 800 }}>{doc.result!.level}</div>
              </div>
              <span aria-hidden style={{ color: ACCENT, fontSize: 20, fontWeight: 800 }}>→</span>
              <div style={{ border: `1.5px solid ${ACCENT}`, color: ACCENT, borderRadius: 8, padding: "10px 22px", textAlign: "center" }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".08em" }}>NEXT MILESTONE</div>
                <div style={{ fontSize: 21, fontWeight: 800 }}>{doc.nextMilestone ?? doc.result!.level}</div>
              </div>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: FAINT }}>The next milestone is presented as a learning goal, not an achieved level.</p>
          </section>

          {/* ── Assessment methodology ── */}
          <section aria-label="Assessment methodology" style={{ margin: "26px 0" }}>
            <SectionTitle>ASSESSMENT METHODOLOGY</SectionTitle>
            <p style={{ margin: 0, fontSize: 13, color: INK, lineHeight: 1.75 }}>{METHODOLOGY_TEXT}</p>
          </section>

          {/* ── Actions + verification ── */}
          <section aria-label="Actions and verification" style={{ margin: "26px 0 0", borderTop: `1px solid ${HAIR}`, paddingTop: 20 }}>
            <SectionTitle>REPORT VERIFICATION</SectionTitle>
            <p style={{ margin: "0 0 10px", fontSize: 12.5, color: MUTED }}>This report can be independently verified via the verification reference or the QR code on the PDF.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <a href="/dashboard" className="button" style={{ padding: "13px 24px" }}>Continue to English Wizard →</a>
              <a href="/api/levelquest/report" className="button secondary">Download Report (PDF)</a>
              <a href="/diagnostic" className="button secondary">Retake assessment</a>
            </div>
          </section>
        </>
      )}

      {/* ── Document footer ── */}
      <footer style={{ marginTop: 34, borderTop: `1px solid ${HAIR}`, paddingTop: 14, display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", fontSize: 11, color: FAINT }}>
        <div>
          <div style={{ fontWeight: 800, color: NAVY, fontSize: 11.5 }}>ENGLISH WIZARD</div>
          <div>CEFR-ALIGNED ENGLISH PROFICIENCY ASSESSMENT</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div>Student ID {doc.studentId} · Report ID {doc.reportRef}</div>
          <div>Issued {doc.dateLong}</div>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".1em", color: NAVY, borderBottom: `1px solid ${HAIR}`, paddingBottom: 6, marginBottom: 12 }}>
      {children}
    </div>
  );
}

function cell(): React.CSSProperties {
  return { padding: "9px 10px", verticalAlign: "middle" };
}

function cellHead(width: string): React.CSSProperties {
  return { padding: "8px 10px", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", width };
}
