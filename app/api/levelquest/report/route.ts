import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { CEFR_ORDER } from "@/src/domain/levelquest";
import {
  buildPlacementReportDoc,
  METHODOLOGY_TEXT,
  INCOMPLETE_MESSAGE,
  type PlacementReportDoc,
} from "@/src/domain/placement-report";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage, type RGB } from "pdf-lib";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

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
  created_at: string;
  display_name: string;
  student_id: string | null;
  duration_seconds: string | number | null;
}

// ── Document palette: navy structure, ink text, single violet accent ──
const NAVY = rgb(0.06, 0.08, 0.21);
const INK = rgb(0.11, 0.13, 0.20);
const MUTED = rgb(0.44, 0.47, 0.56);
const FAINT = rgb(0.60, 0.63, 0.70);
const ACCENT = rgb(0.41, 0.25, 0.84); // English Wizard violet
const HAIR = rgb(0.85, 0.87, 0.91);
const PANEL_BG = rgb(0.984, 0.984, 0.996);
const HEAD_BG = rgb(0.95, 0.955, 0.97);
const ZEBRA = rgb(0.98, 0.985, 0.99);
const WHITE = rgb(1, 1, 1);

const DOC_TITLE = "ENGLISH PROFICIENCY PLACEMENT REPORT";
const DOC_SUBTITLE = "CEFR-ALIGNED ENGLISH PROFICIENCY ASSESSMENT";

const M = 48; // page margin
const W = 595.28;
const H = 841.89;
const CW = W - M * 2;

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const r = await query<ReportRow>(
    `SELECT pr.id, pr.level, pr.confidence, pr.variant, pr.skill_profile, pr.report_json, pr.created_at,
            COALESCE(la.display_name, lp.display_name) AS display_name, l.student_id,
            sess.duration_seconds
     FROM placement_reports pr
     JOIN learners l ON l.id = pr.learner_id
     LEFT JOIN user_accounts la ON la.learner_id = l.id
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
  if (!r.rowCount || !r.rows[0]) {
    return htmlPage(404, "No report available yet", "Complete your English proficiency placement assessment to generate your report.", "/diagnostic", "Take the assessment →");
  }

  const row = r.rows[0];
  const j = row.report_json ?? {};
  const doc = buildPlacementReportDoc({
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

  try {
    const pdf = await PDFDocument.create();
    pdf.setTitle(`${DOC_TITLE} — ${doc.candidate}`);
    pdf.setSubject(DOC_SUBTITLE);
    pdf.setProducer("English Wizard");
    pdf.setKeywords(["CEFR", "English proficiency", "placement", doc.studentId, doc.reportRef]);
    const h = await pdf.embedFont(StandardFonts.Helvetica);
    const b = await pdf.embedFont(StandardFonts.HelveticaBold);
    const logo = await pdf.embedPng(fs.readFileSync(path.join(process.cwd(), "public", "logo.png")));
    const verifyUrl = verifyTarget(req, row.id);
    const qr = await pdf.embedPng(await QRCode.toBuffer(verifyUrl, { type: "png", width: 320, margin: 1 }));

    if (doc.status === "INCOMPLETE") {
      const page = pdf.addPage([W, H]);
      drawIncompletePage(page, doc, h, b, logo);
    } else {
      const p1 = pdf.addPage([W, H]);
      const p2 = pdf.addPage([W, H]);
      drawPage1(p1, doc, h, b, logo);
      drawPage2(p2, doc, h, b, qr, row.id);
    }

    const bytes = await pdf.save();
    const levelPart = doc.result?.level ?? "Incomplete";
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="English-Wizard-Placement-Report-${levelPart}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed.";
    return htmlPage(500, "Report could not be generated", msg, "/diagnostic", "Back to assessment");
  }
}

function verifyTarget(req: Request, reportId: string): string {
  const host = req.headers.get("host") || "english-wizard.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  return `${proto}://${host}/api/levelquest/verify?r=${reportId}`;
}

// ───────────────────────────── layout primitives ─────────────────────────────

const tw = (s: string, size: number, f: PDFFont) => f.widthOfTextAtSize(s, size);

function rightText(page: PDFPage, s: string, y: number, size: number, color: RGB, f: PDFFont) {
  page.drawText(s, { x: W - M - tw(s, size, f), y, size, color, font: f });
}

function centerText(page: PDFPage, s: string, cx: number, y: number, size: number, color: RGB, f: PDFFont) {
  page.drawText(s, { x: cx - tw(s, size, f) / 2, y, size, color, font: f });
}

function text(page: PDFPage, s: string, x: number, y: number, size: number, color: RGB, f: PDFFont) {
  page.drawText(s, { x, y, size, color, font: f });
}

/** Word-wrap to a pixel width; returns the drawn line count. */
function paragraph(page: PDFPage, s: string, x: number, y: number, size: number, color: RGB, f: PDFFont, width: number, leading: number): number {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const attempt = cur ? `${cur} ${word}` : word;
    if (tw(attempt, size, f) > width && cur) {
      lines.push(cur);
      cur = word;
    } else {
      cur = attempt;
    }
  }
  if (cur) lines.push(cur);
  lines.forEach((line, i) => text(page, line, x, y - i * leading, size, color, f));
  return lines.length;
}

/** Section heading: small navy label + full-width hairline. Returns content baseline. */
function section(page: PDFPage, title: string, y: number, h: PDFFont, b: PDFFont): number {
  text(page, title, M, y, 8.5, NAVY, b);
  page.drawLine({ start: { x: M, y: y - 7 }, end: { x: W - M, y: y - 7 }, thickness: 0.8, color: HAIR });
  return y - 20;
}

function metaCell(page: PDFPage, label: string, value: string, x: number, y: number, h: PDFFont, b: PDFFont) {
  text(page, label, x, y, 6.6, MUTED, b);
  text(page, value, x, y - 14, 10.5, INK, h);
}

/** Shared footer: brand, document class, candidate identifiers, page numbers. */
function footer(page: PDFPage, doc: PlacementReportDoc, pageNo: number, totalPages: number, h: PDFFont, b: PDFFont) {
  page.drawLine({ start: { x: M, y: 46 }, end: { x: W - M, y: 46 }, thickness: 0.8, color: HAIR });
  text(page, "ENGLISH WIZARD", M, 34, 7.5, NAVY, b);
  text(page, DOC_SUBTITLE, M, 24, 6.6, FAINT, h);
  const midX = M + tw(DOC_SUBTITLE, 6.6, h) + 24;
  text(page, `Student ID ${doc.studentId}   ·   Report ID ${doc.reportRef}`, midX, 34, 6.6, MUTED, h);
  text(page, `Issued ${doc.dateLong}`, midX, 24, 6.6, MUTED, h);
  rightText(page, `Page ${pageNo} of ${totalPages}`, 34, 7, INK, b);
}

/** Top accent bar — the one decorative element, shared by every page. */
function accentBar(page: PDFPage) {
  page.drawRectangle({ x: 0, y: H - 3, width: W, height: 3, color: ACCENT });
}

// ───────────────────────────── page 1 ─────────────────────────────

function drawPage1(page: PDFPage, doc: PlacementReportDoc, h: PDFFont, b: PDFFont, logo: PDFImage) {
  accentBar(page);

  // ── Header: organisation left, document right, one grid ──
  page.drawImage(logo, { x: M, y: H - 51, width: 40, height: 40 });
  text(page, "ENGLISH WIZARD", M + 52, H - 28, 14.5, NAVY, b);
  text(page, "Personalised English Learning", M + 52, H - 41, 7.5, MUTED, h);
  rightText(page, "ASSESSMENT REPORT", H - 27, 6.6, MUTED, b);
  rightText(page, "ENGLISH PROFICIENCY", H - 42, 12.5, NAVY, b);
  rightText(page, "PLACEMENT REPORT", H - 56, 12.5, NAVY, b);
  rightText(page, "CEFR-ALIGNED ASSESSMENT", H - 70, 7, ACCENT, b);
  page.drawLine({ start: { x: M, y: H - 84 }, end: { x: W - M, y: H - 84 }, thickness: 0.8, color: HAIR });

  // ── Document heading ──
  text(page, DOC_TITLE, M, H - 112, 16, NAVY, b);
  page.drawLine({ start: { x: M, y: H - 121 }, end: { x: W - M, y: H - 121 }, thickness: 1.2, color: NAVY });

  // ── Candidate metadata grid ──
  const col2 = M + CW / 2 + 14;
  const metaTop = H - 142;
  metaCell(page, "CANDIDATE", doc.candidate, M, metaTop, h, b);
  metaCell(page, "STUDENT ID", doc.studentId, col2, metaTop, h, b);
  metaCell(page, "ASSESSMENT DATE", doc.dateLong, M, metaTop - 32, h, b);
  metaCell(page, "REPORT ID", doc.reportRef, col2, metaTop - 32, h, b);
  metaCell(page, "ASSESSMENT METHOD", doc.method, M, metaTop - 64, h, b);

  // ── Overall result ──
  let y = section(page, "OVERALL ENGLISH PROFICIENCY", metaTop - 100, h, b);
  const panelH = 96;
  const panelTop = y + 6;
  page.drawRectangle({ x: M, y: panelTop - panelH, width: CW, height: panelH, borderColor: HAIR, borderWidth: 1, color: PANEL_BG });
  page.drawRectangle({ x: M, y: panelTop - panelH, width: 3, height: panelH, color: ACCENT });
  text(page, doc.result!.level, M + 24, panelTop - 62, 54, ACCENT, b);
  text(page, doc.result!.name, M + 24, panelTop - 82, 11, NAVY, b);
  const padR = W - M - 22;
  page.drawText("CONFIDENCE", { x: padR - tw("CONFIDENCE", 6.6, b), y: panelTop - 30, size: 6.6, color: MUTED, font: b });
  page.drawText(doc.result!.confidence, { x: padR - tw(doc.result!.confidence, 11.5, b), y: panelTop - 45, size: 11.5, color: INK, font: b });
  if (doc.result!.boundary) {
    page.drawText("Boundary placement", { x: padR - tw("Boundary placement", 6.6, h), y: panelTop - 62, size: 6.6, color: MUTED, font: h });
    page.drawText(doc.result!.boundary, { x: padR - tw(doc.result!.boundary, 9, h), y: panelTop - 76, size: 9, color: INK, font: h });
  }
  y = panelTop - panelH - 20;

  // ── Assessment summary ──
  y = section(page, "ASSESSMENT SUMMARY", y, h, b);
  const stats = doc.stats;
  const statW = CW / Math.max(1, stats.length);
  stats.forEach((st, i) => {
    const sx = M + i * statW;
    text(page, st.label.toUpperCase(), sx, y, 6.4, MUTED, b);
    text(page, st.value, sx, y - 17, 13.5, INK, b);
  });
  y = y - 42;

  // ── CEFR proficiency scale ──
  y = section(page, "CEFR PROFICIENCY SCALE", y, h, b);
  paragraph(
    page,
    "The Common European Framework of Reference for Languages (CEFR) provides a structured, internationally recognised framework for describing language proficiency.",
    M, y, 8.5, MUTED, h, CW, 12,
  );
  y -= 18;
  drawCefrScale(page, doc, y, h, b);
  y -= 26 + 30 + 22; // cells + marker zone + breathing room

  // ── Skill profile ──
  y = section(page, "SKILL PROFILE", y, h, b);
  drawSkillTable(page, doc, y, h, b);

  footer(page, doc, 1, 2, h, b);
}

/** CEFR scale: seven equal segments; CURRENT LEVEL marker aligned below the placed cell. */
function drawCefrScale(page: PDFPage, doc: PlacementReportDoc, y: number, h: PDFFont, b: PDFFont) {
  const levels = CEFR_ORDER;
  const n = levels.length;
  const gap = 3;
  const cellW = (CW - (n - 1) * gap) / n;
  const cellH = 26;

  levels.forEach((lv, i) => {
    const cx = M + i * (cellW + gap);
    const placed = lv === doc.result?.level;
    page.drawRectangle({ x: cx, y: y - cellH, width: cellW, height: cellH, color: placed ? ACCENT : HEAD_BG });
    centerText(page, lv, cx + cellW / 2, y - 17, 9, placed ? WHITE : NAVY, b);
  });

  if (doc.cefrIndex >= 0) {
    const cx = M + doc.cefrIndex * (cellW + gap) + cellW / 2;
    const baseY = y - cellH - 4; // top of the marker zone
    page.drawSvgPath("M 0 0 L 10 0 L 5 -6 Z", { x: cx - 5, y: baseY, color: ACCENT });
    centerText(page, "CURRENT LEVEL", cx, baseY - 18, 6.4, ACCENT, b);
  } else {
    centerText(page, "No level was awarded in this sitting", M + CW / 2, y - cellH - 12, 7.5, MUTED, h);
  }
}

/** Skill profile table. */
function drawSkillTable(page: PDFPage, doc: PlacementReportDoc, y: number, h: PDFFont, b: PDFFont): void {
  const colSkill = M + 10;
  const colLevel = M + 150;
  const colScore = M + 232;
  const colEvidence = M + 300;
  const headH = 20;
  const rowH = 24;

  page.drawRectangle({ x: M, y: y - headH, width: CW, height: headH, color: HEAD_BG });
  text(page, "Skill", colSkill, y - 14, 8.5, NAVY, b);
  text(page, "CEFR Level", colLevel, y - 14, 8.5, NAVY, b);
  text(page, "Score", colScore, y - 14, 8.5, NAVY, b);
  text(page, "Evidence", colEvidence, y - 14, 8.5, NAVY, b);

  let ry = y - headH;
  doc.skills.forEach((s, i) => {
    ry -= rowH;
    if (i % 2 === 1) page.drawRectangle({ x: M, y: ry, width: CW, height: rowH, color: ZEBRA });
    const midY = ry + 8.5;
    text(page, s.label, colSkill, midY, 9.5, INK, b);
    if (s.assessed) {
      text(page, s.level ?? "—", colLevel, midY, 9.5, ACCENT, b);
      text(page, s.score != null ? `${s.score}%` : "—", colScore, midY, 9.5, INK, h);
    } else {
      text(page, "Not assessed", colLevel, midY, 9.5, FAINT, h);
      text(page, "—", colScore, midY, 9.5, FAINT, h);
    }
    text(page, s.evidence + (s.lowEvidence ? " *" : ""), colEvidence, midY, 8.5, s.assessed ? MUTED : FAINT, h);
  });
  if (doc.skills.some((s) => s.lowEvidence)) {
    text(page, "* Band based on limited questions in this sitting — it may firm up as practice continues.", colSkill, ry - 8, 7.5, FAINT, h);
  }
}

// ───────────────────────────── page 2 ─────────────────────────────

function drawPage2(page: PDFPage, doc: PlacementReportDoc, h: PDFFont, b: PDFFont, qr: PDFImage, verificationId: string) {
  accentBar(page);
  text(page, DOC_TITLE, M, H - 26, 8.5, NAVY, b);
  rightText(page, "ENGLISH WIZARD", H - 26, 7.5, NAVY, b);
  page.drawLine({ start: { x: M, y: H - 36 }, end: { x: W - M, y: H - 36 }, thickness: 0.8, color: HAIR });

  let y = H - 62;

  // ── What this level means ──
  y = section(page, "WHAT THIS LEVEL MEANS", y, h, b);
  const lines = paragraph(page, doc.result!.meaning, M, y, 9.5, INK, h, CW, 14);
  y -= lines * 14 + 18;

  // ── Strengths ──
  y = section(page, "STRENGTHS", y, h, b);
  text(page, doc.strengthsNote, M, y, 8, MUTED, h);
  y -= 16;
  for (const s of doc.strengths) {
    text(page, `•  ${s.label} — ${s.score}% across ${s.questions} question${s.questions === 1 ? "" : "s"}`, M + 6, y, 9.5, INK, h);
    y -= 15;
  }
  y -= 12;

  // ── Development priorities ──
  y = section(page, "DEVELOPMENT PRIORITIES", y, h, b);
  text(page, doc.prioritiesNote, M, y, 8, MUTED, h);
  y -= 16;
  for (const s of doc.priorities) {
    text(page, `•  ${s.label} — ${s.score}% across ${s.questions} question${s.questions === 1 ? "" : "s"}`, M + 6, y, 9.5, INK, h);
    y -= 15;
  }
  y -= 12;

  // ── Recommended starting point ──
  y = section(page, "RECOMMENDED STARTING POINT", y, h, b);
  text(page, doc.programme, M, y, 12, NAVY, b);
  y -= 22;
  const boxW = 118;
  const boxH = 46;
  const boxY = y - boxH;
  const arrowGap = 34;
  const box2X = M + boxW + arrowGap;

  page.drawRectangle({ x: M, y: boxY, width: boxW, height: boxH, color: ACCENT });
  centerText(page, "CURRENT LEVEL", M + boxW / 2, boxY + boxH - 16, 6.4, WHITE, b);
  centerText(page, doc.result!.level, M + boxW / 2, boxY + boxH - 37, 17, WHITE, b);

  page.drawRectangle({ x: box2X, y: boxY, width: boxW, height: boxH, borderColor: ACCENT, borderWidth: 1.2 });
  centerText(page, "NEXT MILESTONE", box2X + boxW / 2, boxY + boxH - 16, 6.4, ACCENT, b);
  centerText(page, doc.nextMilestone ?? doc.result!.level, box2X + boxW / 2, boxY + boxH - 37, 17, ACCENT, b);

  const arrowY = boxY + boxH / 2;
  page.drawLine({ start: { x: M + boxW + 8, y: arrowY }, end: { x: box2X - 8, y: arrowY }, thickness: 1.1, color: ACCENT });
  page.drawSvgPath("M 0 -3.5 L 0 3.5 L 7 0 Z", { x: box2X - 9, y: arrowY, color: ACCENT });

  y = boxY - 14;
  paragraph(page, "The next milestone is presented as a learning goal, not an achieved level. Your programme adapts as your evidence grows.", M, y, 7.8, FAINT, h, CW, 11);
  y -= 32;

  // ── Assessment methodology ──
  y = section(page, "ASSESSMENT METHODOLOGY", y, h, b);
  const mLines = paragraph(page, METHODOLOGY_TEXT, M, y, 9, INK, h, CW, 13.5);
  y -= mLines * 13.5 + 26;

  // ── Report verification ──
  y = section(page, "REPORT VERIFICATION", y, h, b);
  paragraph(page, "This report can be independently verified using the verification reference below.", M, y, 8.5, MUTED, h, CW, 12);
  y -= 20;

  page.drawImage(qr, { x: M, y: y - 74, width: 74, height: 74 });
  const vx = M + 96;
  text(page, "VERIFICATION REFERENCE", vx, y - 4, 6.6, MUTED, b);
  text(page, verificationId, vx, y - 18, 7.5, INK, h);
  text(page, "REPORT ID", vx, y - 38, 6.6, MUTED, b);
  text(page, doc.reportRef, vx, y - 52, 9.5, NAVY, b);
  text(page, "Scan the QR code to open this report's verification page.", vx, y - 68, 7.8, MUTED, h);

  footer(page, doc, 2, 2, h, b);
}

// ───────────────────────────── incomplete report ─────────────────────────────

function drawIncompletePage(page: PDFPage, doc: PlacementReportDoc, h: PDFFont, b: PDFFont, logo: PDFImage) {
  accentBar(page);
  page.drawImage(logo, { x: M, y: H - 51, width: 40, height: 40 });
  text(page, "ENGLISH WIZARD", M + 52, H - 28, 14.5, NAVY, b);
  text(page, "Personalised English Learning", M + 52, H - 41, 7.5, MUTED, h);
  rightText(page, "ASSESSMENT REPORT", H - 27, 6.6, MUTED, b);
  rightText(page, "ASSESSMENT INCOMPLETE", H - 42, 12.5, NAVY, b);
  rightText(page, DOC_SUBTITLE, H - 56, 7, ACCENT, b);
  page.drawLine({ start: { x: M, y: H - 84 }, end: { x: W - M, y: H - 84 }, thickness: 0.8, color: HAIR });

  text(page, "ASSESSMENT INCOMPLETE", M, H - 112, 16, NAVY, b);
  page.drawLine({ start: { x: M, y: H - 121 }, end: { x: W - M, y: H - 121 }, thickness: 1.2, color: NAVY });

  const col2 = M + CW / 2 + 14;
  const metaTop = H - 142;
  metaCell(page, "CANDIDATE", doc.candidate, M, metaTop, h, b);
  metaCell(page, "STUDENT ID", doc.studentId, col2, metaTop, h, b);
  metaCell(page, "ASSESSMENT DATE", doc.dateLong, M, metaTop - 32, h, b);
  metaCell(page, "REPORT ID", doc.reportRef, col2, metaTop - 32, h, b);
  metaCell(page, "ASSESSMENT METHOD", doc.method, M, metaTop - 64, h, b);

  let y = section(page, "STATUS", metaTop - 100, h, b);
  const panelH = 72;
  const panelTop = y + 6;
  page.drawRectangle({ x: M, y: panelTop - panelH, width: CW, height: panelH, borderColor: HAIR, borderWidth: 1, color: PANEL_BG });
  page.drawRectangle({ x: M, y: panelTop - panelH, width: 3, height: panelH, color: NAVY });
  text(page, INCOMPLETE_MESSAGE, M + 20, panelTop - 30, 9.5, INK, h);
  paragraph(page, "This document is not a placement result. Levels appear only once valid assessment responses have been recorded.", M + 20, panelTop - 48, 8.5, MUTED, h, CW - 40, 12);

  y = section(page, "ASSESSMENT METHODOLOGY", panelTop - panelH - 26, h, b);
  paragraph(page, METHODOLOGY_TEXT, M, y, 9, INK, h, CW, 13.5);

  footer(page, doc, 1, 1, h, b);
}

// ───────────────────────────── error page ─────────────────────────────

function htmlPage(status: number, title: string, body: string, href: string, cta: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:sans-serif;background:#f4f5fb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="max-width:520px;background:#fff;border-radius:14px;padding:34px;box-shadow:0 8px 24px rgba(15,21,53,.1);text-align:center"><div style="font-size:44px">📄</div><h2 style="margin:10px 0 6px;color:#172033">${title}</h2><p style="color:#64748b;line-height:1.6">${body}</p><a href="${href}" style="display:inline-block;margin-top:14px;padding:11px 22px;background:#6840d6;color:#fff;border-radius:9px;text-decoration:none;font-weight:700">${cta}</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
