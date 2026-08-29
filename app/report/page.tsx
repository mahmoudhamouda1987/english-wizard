import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { CEFR_ORDER } from "@/src/domain/levelquest";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Placement Report — English Wizard",
  description: "Your CEFR-aligned English proficiency placement report.",
};

interface ReportRow {
  id: string;
  level: string;
  confidence: string;
  variant: number;
  skill_profile: Record<string, string>;
  report_json: {
    estimate?: number;
    answeredCount?: number;
    boundary?: string | null;
    skillScores?: Record<string, number>;
    skillLowEvidence?: string[];
    skillAnswered?: Record<string, number>;
    strengths?: string[];
    focusAreas?: string[];
    speakingSubmitted?: boolean;
    speakingResponses?: number;
    speakingBand?: string | null;
  };
  created_at: Date;
  display_name: string;
  student_id: string | null;
}

const LEVEL_COLOR: Record<string, string> = { "Pre-A1": "#64748b", A1: "#38bdf8", A2: "#34d399", B1: "#fbbf24", B2: "#fb923c", C1: "#f87171", C2: "#a855f7" };
const SKILL_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading", listening: "Listening", speaking: "Speaking" };
const SKILL_ICON: Record<string, string> = { grammar: "🔤", vocabulary: "📚", reading: "📖", listening: "🎧", speaking: "🗣️" };
const OBJECTIVE = ["grammar", "vocabulary", "reading", "listening"];

export default async function ReportPage() {
  const user = await currentUser();
  if (!user) redirect(`/auth?next=/report`);

  const r = await query<ReportRow>(
    `SELECT pr.id, pr.level, pr.confidence, pr.variant, pr.skill_profile, pr.report_json, pr.created_at,
            COALESCE(ua.display_name, lp.display_name) AS display_name, l.student_id
     FROM placement_reports pr
     JOIN learners l ON l.id = pr.learner_id
     LEFT JOIN user_accounts ua ON ua.learner_id = l.id
     LEFT JOIN learner_profiles lp ON lp.learner_id = l.id
     WHERE pr.learner_id = $1::uuid
     ORDER BY pr.created_at DESC LIMIT 1`,
    [user.learnerId],
  );
  if (!r.rowCount || !r.rows[0]) redirect("/diagnostic");

  const row = r.rows[0];
  const skill = row.skill_profile ?? {};
  const scores = row.report_json?.skillScores ?? {};
  const answered = row.report_json?.skillAnswered ?? {};
  const date = new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main id="main-content" style={{ maxWidth: 820, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Image src="/logo.png" alt="English Wizard logo" width={56} height={56} style={{ borderRadius: 12 }} unoptimized />
        <p className="eyebrow" style={{ marginTop: 8 }}>ENGLISH WIZARD · LEVELQUEST · CEFR-ALIGNED PLACEMENT ASSESSMENT</p>
        <h1 style={{ fontSize: 26, margin: "4px 0" }}>Placement Report</h1>
        {/* Student identity block (Part 16) */}
        <div style={{ display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap", marginTop: 12, fontSize: 13 }}>
          <span><strong>{row.display_name}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Student name</span></span>
          <span><strong style={{ fontVariantNumeric: "tabular-nums" }}>{row.student_id ?? "—"}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Student ID</span></span>
          <span><strong>{date}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Assessment date</span></span>
          <span><strong style={{ fontSize: 12, fontFamily: "monospace" }}>{row.id.slice(0, 8).toUpperCase()}</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Assessment ID</span></span>
          <span><strong>Version {row.variant} of 15</strong><span className="subtle" style={{ display: "block", fontSize: 11 }}>Assessment edition</span></span>
        </div>
      </div>

      <section className="panel" style={{ padding: 28, textAlign: "center", background: "linear-gradient(135deg, #0f1535, #2a1a4a)", color: "white", borderRadius: 18 }}>
        <div style={{ fontSize: 12.5, opacity: .7, textTransform: "uppercase", letterSpacing: ".12em" }}>Overall English Level</div>
        <div style={{ fontSize: 80, fontWeight: 900, margin: "8px 0" }}>{row.level}</div>
        <div style={{ fontSize: 18 }}>{row.confidence} Confidence</div>
        <p className="subtle" style={{ color: "#cbd5e1", fontSize: 13 }}>Adaptive estimate {row.report_json?.estimate ?? "—"} · {row.report_json?.answeredCount ?? 0} responses analysed{row.report_json?.boundary ? ` · ${row.report_json.boundary}` : ""}</p>
      </section>

      <section className="panel" style={{ padding: "30px 24px 24px", marginTop: 18 }}>
        <h3 style={{ margin: "0 0 20px" }}>Your journey on the CEFR scale</h3>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 4, paddingTop: 8 }}>
          {CEFR_ORDER.map((lv, i) => {
            const reached = i <= CEFR_ORDER.indexOf(row.level as typeof CEFR_ORDER[number]);
            const isCurrent = lv === row.level;
            return (
              <div key={lv} style={{ display: "flex", flex: 1, alignItems: "center", flexDirection: "column", minWidth: 80, position: "relative" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: reached ? `${LEVEL_COLOR[lv] ?? "#64748b"}22` : "#f1f5f9", border: `3px solid ${reached ? LEVEL_COLOR[lv] ?? "#64748b" : "#e2e8f0"}`, color: reached ? LEVEL_COLOR[lv] ?? "#64748b" : "#94a3b8", fontWeight: 800, fontSize: 11 }}>
                  {lv}
                </div>
                {isCurrent && <span style={{ position: "absolute", top: -22, fontSize: 10, whiteSpace: "nowrap", color: "white", background: LEVEL_COLOR[lv] ?? "#64748b", padding: "2px 7px", borderRadius: 6, fontWeight: 700 }}>YOU ARE HERE</span>}
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 18 }}>
        <h3 style={{ margin: "0 0 18px" }}>Skill profile</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {[...OBJECTIVE, "speaking"].map((sk) => {
            const lv = skill[sk];
            const score = scores[sk];
            const isSpeaking = sk === "speaking";
            const attempted = isSpeaking ? Boolean(row.report_json?.speakingSubmitted) : (answered[sk] ?? 0) > 0;
            return (
              <div key={sk} style={{ display: "grid", gridTemplateColumns: "130px 44px 1fr 60px", gap: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{SKILL_ICON[sk] ?? ""} {SKILL_LABEL[sk] ?? sk}</span>
                <strong style={{ textAlign: "center", color: attempted ? LEVEL_COLOR[lv] ?? "#4338ca" : "#94a3b8", fontSize: 14 }}>
                  {isSpeaking ? (attempted ? "Submitted" : "—") : attempted ? lv : "—"}
                </strong>
                {isSpeaking ? (
                  <div className="subtle" style={{ fontSize: 12 }}>Recorded &amp; typed responses reviewed in guided conversation.</div>
                ) : (
                  <div style={{ height: 12, background: "#eef1f6", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    {attempted && <div style={{ width: `${score}%`, height: "100%", background: `${LEVEL_COLOR[lv] ?? "#6840d6"}`, borderRadius: 6 }} />}
                  </div>
                )}
                <span style={{ fontSize: 12.5, opacity: .7, textAlign: "right" }}>
                  {isSpeaking ? (attempted ? `${row.report_json?.speakingResponses ?? 0} resp.` : "n/a") : attempted ? `${row.report_json?.skillLowEvidence?.includes(sk) ? `${score}%*` : `${score}%`}` : "n/a"}
                </span>
              </div>
            );
          })}
        </div>
        {(row.report_json?.skillLowEvidence?.length ?? 0) > 0 && (
          <p className="subtle" style={{ fontSize: 11.5, margin: "12px 0 0" }}>* Based on limited questions in this sitting — the band may firm up as you practise.</p>
        )}
      </section>

      <section className="panel" style={{ padding: 24, marginTop: 18, background: "linear-gradient(135deg,#f6f2ff,#f0f4ff)" }}>
        <h3 style={{ margin: "0 0 8px" }}>Recommended starting point</h3>
        <p style={{ margin: "0 0 6px", lineHeight: 1.7 }}>Your English Wizard journey begins at <strong>{row.level}</strong>.</p>
        <p style={{ margin: "0 0 12px", color: "#6840d6", fontWeight: 600, fontSize: 14.5 }}>Your level has been discovered. Now let&rsquo;s build your path.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href="/dashboard" className="button" style={{ padding: "13px 24px" }}>Continue to English Wizard →</a>
          <a href="/api/levelquest/report" className="button secondary">⬇️ Download Report (PDF)</a>
          <a href="/diagnostic" className="button secondary">Retake assessment</a>
        </div>
        <p className="subtle" style={{ marginTop: 14, fontSize: 12 }}>
          Report reference <code>{row.id}</code> · verified via the QR code on the official PDF.
        </p>
      </section>
    </main>
  );
}
