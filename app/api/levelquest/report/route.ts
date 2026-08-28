import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { CEFR_ORDER } from "@/src/domain/levelquest";

export const dynamic = "force-dynamic";

type CEFRLevel = (typeof import("@/src/domain/levelquest").CEFR_ORDER)[number];

interface ReportRow {
  level: string;
  confidence: string;
  variant: number;
  skill_profile: Record<string, string>;
  report_json: { skillScores?: Record<string, number>; strengths?: string[]; focusAreas?: string[]; estimate?: number; answeredCount?: number; speakingSubmitted?: boolean; speakingResponses?: number };
  created_at: string;
  display_name: string;
  student_id: string | null;
}

const SKILL_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading", listening: "Listening", speaking: "Speaking" };
const LEVEL_COLOR: Record<string, string> = { "Pre-A1": "#64748b", A1: "#0ea5e9", A2: "#10b981", B1: "#f59e0b", B2: "#f97316", C1: "#ef4444", C2: "#a855f7" };

/** Returns a premium, printable HTML placement report that can be saved as PDF from the browser. */
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const r = await query<ReportRow>(
    `SELECT pr.level, pr.confidence, pr.variant, pr.skill_profile, pr.report_json, pr.created_at,
            l.display_name, l.student_id
     FROM placement_reports pr
     JOIN learners l ON l.id = pr.learner_id
     WHERE pr.learner_id = $1::uuid
     ORDER BY pr.created_at DESC LIMIT 1`,
    [user.learnerId],
  );
  if (!r.rowCount || !r.rows[0]) {
    return NextResponse.json({ error: "No placement report found yet. Complete LevelQuest first." }, { status: 404 });
  }
  const row = r.rows[0];
  const skill = row.skill_profile ?? {};
  const scores = row.report_json?.skillScores ?? {};
  const strengths = row.report_json?.strengths ?? [];
  const focus = row.report_json?.focusAreas ?? [];
  const objective = ["grammar", "vocabulary", "reading", "listening"];
  const speakingSubmitted = Boolean(row.report_json?.speakingSubmitted);
  const speakingResponses = Number(row.report_json?.speakingResponses ?? 0);
  const studentId = row.student_id ?? "—";
  const date = new Date(row.created_at).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const rows = objective.map((s) => `
    <tr>
      <td class="c1">${SKILL_LABEL[s] ?? s}</td>
      <td class="c2" style="color:${LEVEL_COLOR[skill[s]] ?? "#334155"}"><strong>${skill[s] ?? "—"}</strong></td>
      <td><div class="barwrap"><div class="bar" style="width:${scores[s] ?? 0}%;background:${LEVEL_COLOR[skill[s]] ?? "#6840d6"}"></div></div></td>
      <td class="c3">${scores[s] ?? 0}%</td>
    </tr>`).join("");

  const speakingRow = `
    <tr>
      <td class="c1">🎙️ Speaking (production)</td>
      <td class="c2" style="color:#a855f7"><strong>${speakingSubmitted ? "Submitted" : "—"}</strong></td>
      <td colspan="2" class="c4">Recorded &amp; typed responses ${speakingSubmitted ? `(${speakingResponses} prompt${speakingResponses === 1 ? "" : "s"})` : ""} — reviewed in guided conversation, not auto-scored.</td>
    </tr>`;

  const placedLevel = row.level as CEFRLevel;
  const process = row.level && CEFR_ORDER.includes(placedLevel) ? `
    <div class="proc">
      ${CEFR_ORDER.map((lv, i) => {
        const reached = i <= CEFR_ORDER.indexOf(placedLevel);
        return `<span class="proc-step ${reached ? "reached" : ""}" style="${i === CEFR_ORDER.indexOf(placedLevel) ? `border-color:${LEVEL_COLOR[lv]};color:${LEVEL_COLOR[lv]}` : ""}">${lv}</span>`;
      }).join('')}
    </div>` : "";

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>English Wizard — Placement Report</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#172033;background:#eef1f6;padding:24px}
  .sheet{max-width:820px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(15,21,53,.12)}
  header{background:linear-gradient(135deg,#0f1535,#2a1a4a);color:#fff;padding:32px 40px}
  header .eyebrow{font-size:12px;letter-spacing:.18em;text-transform:uppercase;opacity:.75}
  header h1{font-size:26px;margin:6px 0 2px}
  header .sub{opacity:.75;font-size:13px}
  .idpane{padding:18px 40px;background:#f6f2ff;font-size:13px;color:#4338ca;display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px}
  .idpane b{color:#2a1a4a}
  .body{padding:34px 40px}
  .levelhero{text-align:center;padding:6px 0 22px}
  .levelhero .lvl{font-size:76px;font-weight:900;line-height:1}
  .levelhero .conf{font-size:17px;margin-top:4px}
  .proc{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:22px 0 6px}
  .proc-step{border:2px solid #dbe3ee;color:#94a3b8;border-radius:20px;padding:5px 12px;font-weight:800;font-size:11.5px}
  .proc-step.reached{border-color:#6840d6;color:#6840d6;background:#f0ebff}
  h2{font-size:17px;margin:26px 0 12px;color:#172033}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;color:#7c8196;padding:6px 8px;border-bottom:2px solid #eef0f7}
  td{padding:10px 8px;border-bottom:1px solid #eef0f7;font-size:14px}
  .c1{font-weight:600}.c2{width:64px}.c3{width:64px;text-align:right;color:#5b6272}
  .barwrap{height:10px;background:#eef0f7;border-radius:6px;overflow:hidden}
  .bar{height:100%;border-radius:6px}
  .cols{display:flex;gap:18px;flex-wrap:wrap}
  .col{flex:1 1 240px;background:#f8fafc;border-radius:12px;padding:16px 18px;border-left:4px solid #10b981}
  .col.focus{border-left-color:#fb923c}
  .col h3{font-size:14px;margin-bottom:8px}
  .col ul{padding-left:18px;line-height:1.9;font-size:13.5px}
  footer{padding:20px 40px;border-top:1px solid #eef0f7;font-size:11.5px;color:#7c8196;text-align:center}
  .printbtn{position:fixed;top:16px;right:16px;background:#6840d6;color:#fff;border:0;padding:12px 20px;border-radius:10px;font-weight:800;cursor:pointer;font-size:14px;box-shadow:0 8px 20px rgba(104,64,214,.4)}
  @media print{ body{background:#fff;padding:0} .sheet{box-shadow:none;border-radius:0} .printbtn{display:none} }
</style></head>
<body>
<button class="printbtn" onclick="window.print()">🖨️ Download / Print as PDF</button>
<div class="sheet">
  <header>
    <div class="eyebrow">English Wizard · LevelQuest</div>
    <h1>Official Placement Report</h1>
    <div class="sub">Adaptive English Placement Assessment · Variant ${row.variant} · ${date}</div>
  </header>
  <div class="idpane">
    <span>Student: <b>${escapeHtml(row.display_name)}</b></span>
    <span>Student ID: <b>${escapeHtml(studentId)}</b></span>
  </div>
  <div class="body">
    <div class="levelhero">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:.16em;opacity:.6">Your English Level</div>
      <div class="lvl" style="color:${LEVEL_COLOR[row.level] ?? "#6840d6"}">${row.level}</div>
      <div class="conf">${row.confidence} confidence</div>
    </div>
    ${process}
    <h2>Skill Profile</h2>
    <table>
      <thead><tr><th>Skill</th><th>Level</th><th>Strength</th><th>Score</th></tr></thead>
      <tbody>${rows}${speakingRow}</tbody>
    </table>
    <div class="cols">
      <div class="col"><h3>🌟 Strengths</h3><ul>${(strengths.length ? strengths : ["—"]).map((s) => `<li>${SKILL_LABEL[s] ?? s}</li>`).join("")}</ul></div>
      <div class="col focus"><h3>🎯 Focus areas</h3><ul>${(focus.length ? focus : ["—"]).map((s) => `<li>${SKILL_LABEL[s] ?? s}</li>`).join("")}</ul></div>
    </div>
    <p style="margin-top:22px;font-size:12.5px;color:#5b6272;line-height:1.7">Your personalized English Wizard path starts at <strong>${row.level}</strong>, reinforcing focus areas while building on strengths. ${row.report_json?.estimate !== undefined ? `Adaptive estimate boundary: ${row.report_json.estimate}.` : ""} ${row.report_json?.answeredCount !== undefined ? `${row.report_json.answeredCount} responses analyzed.` : ""}</p>
  </div>
  <footer>This report is generated from your LevelQuest placement assessment. It reflects your current estimated English proficiency across the Common European Framework of Reference (CEFR).</footer>
</div>
<script>setTimeout(()=>window.print(),400)</script>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="English-Wizard-Placement-Report-${row.level}.html"`,
      "Cache-Control": "no-store",
    },
  });
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
