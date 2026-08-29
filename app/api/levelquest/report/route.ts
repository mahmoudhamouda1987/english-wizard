import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { CEFR_ORDER } from "@/src/domain/levelquest";
import { PDFDocument, StandardFonts, rgb, type RGB } from "pdf-lib";
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
    strengths?: string[];
    focusAreas?: string[];
    estimate?: number;
    answeredCount?: number;
    speakingSubmitted?: boolean;
    speakingResponses?: number;
  };
  created_at: string;
  display_name: string;
  email: string | null;
  student_id: string | null;
}

const LEVEL_COLOR: Record<string, [number, number, number]> = {
  "Pre-A1": [0.42, 0.46, 0.53], A1: [0.05, 0.65, 0.91], A2: [0.06, 0.72, 0.51],
  B1: [0.96, 0.62, 0.04], B2: [0.98, 0.45, 0.09], C1: [0.94, 0.27, 0.27], C2: [0.66, 0.33, 0.97],
};
const NAVY: [number, number, number] = [0.06, 0.08, 0.21];
const INK: [number, number, number] = [0.09, 0.13, 0.20];
const MUTED: [number, number, number] = [0.45, 0.49, 0.58];
const LIGHT: [number, number, number] = [0.92, 0.94, 0.97];
const DIVIDER: [number, number, number] = [0.87, 0.90, 0.94];
const WHITE: [number, number, number] = [1, 1, 1];
const SOFT: [number, number, number] = [0.72, 0.74, 0.82];

const SKILL_LABEL: Record<string, string> = { grammar: "Grammar", vocabulary: "Vocabulary", reading: "Reading", listening: "Listening", speaking: "Speaking" };
const LEVEL_DESCRIPTOR: Record<string, string> = {
  "Pre-A1": "Recognises familiar words and very basic phrases in familiar contexts.",
  A1: "Can understand and use familiar everyday expressions and very basic phrases.",
  A2: "Can understand sentences and frequently used expressions related to everyday areas.",
  B1: "Can deal with most situations likely to arise while travelling and describe experiences and events.",
  B2: "Can interact with fluency that makes regular communication with native speakers possible.",
  C1: "Can express ideas fluently and use language flexibly for social, academic and professional purposes.",
  C2: "Can understand virtually everything heard or read and summarise information from multiple sources.",
};

const R = (c: [number, number, number]) => rgb(c[0], c[1], c[2]);
const M = 46;

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const r = await query<ReportRow>(
    `SELECT pr.id, pr.level, pr.confidence, pr.variant, pr.skill_profile, pr.report_json, pr.created_at,
            l.display_name, la.email, l.student_id
     FROM placement_reports pr
     JOIN learners l ON l.id = pr.learner_id
     LEFT JOIN user_accounts la ON la.learner_id = l.id
     WHERE pr.learner_id = $1::uuid
     ORDER BY pr.created_at DESC LIMIT 1`,
    [user.learnerId],
  );
  if (!r.rowCount || !r.rows[0]) {
    return htmlPage(404, "No report available yet", "Complete your LevelQuest placement assessment to generate your official CEFR placement report.", "/diagnostic", "Take the assessment →");
  }

  const row = r.rows[0];
  const skill = row.skill_profile ?? {};
  const scores = row.report_json?.skillScores ?? {};
  const answered = row.report_json?.skillAnswered ?? {};
  const strengths = row.report_json?.strengths ?? [];
  const focus = row.report_json?.focusAreas ?? [];
  const objective = ["grammar", "vocabulary", "reading", "listening"];
  const studentId = row.student_id ?? "—";
  const host = req.headers.get("host") || "english-wizard.vercel.app";
  const proto = req.headers.get("x-forwarded-proto") || "https";
  const verifyUrl = `${proto}://${host}/api/levelquest/verify?r=${row.id}`;
  const date = new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const placed = row.level as string;

  try {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]);
    const W = page.getWidth();
    const H = page.getHeight();
    const h = await pdf.embedFont(StandardFonts.Helvetica);
    const b = await pdf.embedFont(StandardFonts.HelveticaBold);
    const logo = await pdf.embedPng(fs.readFileSync(path.join(process.cwd(), "public", "logo.png")));
    const qr = await pdf.embedPng(await QRCode.toBuffer(verifyUrl, { type: "png", width: 320, margin: 1 }));

    const text = (s: string, x: number, y: number, size: number, color: RGB, font = h) =>
      page.drawText(s, { x, y, size, color, font });
    const tw = (s: string, size: number) => s.length * size * 0.56;
    let y = H;

    // ── Header band ──
    page.drawRectangle({ x: 0, y: H - 120, width: W, height: 120, color: R(NAVY) });
    page.drawImage(logo, { x: M, y: H - 106, width: 62, height: 62 });
    text("English Wizard", M + 76, H - 94, 21, R(WHITE), b);
    text("Personalised English Proficiency", M + 76, H - 116, 9.5, R(SOFT));
    text("OFFICIAL PLACEMENT REPORT", W - M - 252, H - 90, 10.5, R([0.9, 0.88, 0.97]), b);
    text("CEFR-aligned · LevelQuest", W - M - 252, H - 108, 9, R(SOFT));

    // ── Title ──
    y = H - 152;
    text("Placement Report — English Proficiency", M, y, 16, R(INK), b);
    page.drawLine({ start: { x: M, y: y - 6 }, end: { x: W - M, y: y - 6 }, thickness: 1.4, color: R(NAVY) });

    // ── Candidate + session info (3 rows, 2 columns) ──
    const c2 = W / 2 + 12;
    const info: [string, string, number][] = [
      ["Candidate", row.display_name || "—", M],
      ["Test date", date, c2],
      ["Student ID", studentId, M],
      ["Assessment", "LevelQuest — CEFR Placement", c2],
      ["Issue date", date, M],
      ["Variant", `Version ${row.variant} of 15`, c2],
    ];
    y = y - 34;
    info.forEach((f, i) => {
      const rowY = y - Math.floor(i / 2) * 40;
      const x = f[2];
      text(f[0].toUpperCase(), x, rowY, 7.5, R(MUTED), b);
      text(f[1], x, rowY - 14, 10.5, R(INK));
    });
    y = y - 3 * 40;

    // ── Overall result hero ──
    const heroH = 104;
    page.drawRectangle({ x: M, y: y - heroH, width: W - M * 2, height: heroH, borderColor: R(DIVIDER), borderWidth: 1, color: R([0.985, 0.988, 0.995]) });
    text("OVERALL ENGLISH LEVEL", M + 20, y - 26, 9, R(MUTED), b);
    text(`${row.report_json?.answeredCount ?? 0} responses analysed`, M + 20, y - 42, 9.5, R(MUTED));
    text(`${row.confidence} confidence · adaptive estimate ${row.report_json?.estimate ?? "—"}`, M + 20, y - 58, 9.5, R(MUTED));
    text(placed, W - M - 200, y - 66, 46, R(LEVEL_COLOR[placed] ?? NAVY), b);
    y = y - heroH - 30;

    // ── CEFR band strip ──
    text("COMMON EUROPEAN FRAMEWORK OF REFERENCE (CEFR)", M, y - 6, 8, R(MUTED), b);
    const n = CEFR_ORDER.length;
    const gap = 4;
    const cellW = (W - M * 2 - (n - 1) * gap) / n;
    const cellH = 32;
    const cy = y - 34;
    CEFR_ORDER.forEach((lv, i) => {
      const cx = M + i * (cellW + gap);
      const isPlaced = lv === placed;
      page.drawRectangle({ x: cx, y: cy, width: cellW, height: cellH, color: isPlaced ? R(LEVEL_COLOR[lv] ?? NAVY) : R(LIGHT) });
      text(lv, cx + cellW / 2 - tw(lv, 10) / 2, cy + 12, 10, isPlaced ? R(WHITE) : R(NAVY), b);
      if (isPlaced) text("RESULT", cx + cellW / 2 - tw("RESULT", 6.5) / 2, cy - 13, 6.5, R(LEVEL_COLOR[lv] ?? NAVY));
    });
    y = cy - 30;

    // ── Skill profile table ──
    text("SKILL PROFILE", M, y - 6, 8, R(MUTED), b);
    const col1 = M + 12;
    const col2 = M + 150;
    const col3 = M + 246;
    const stX = M + 320;
    const tableTop = y - 26;
    page.drawRectangle({ x: M, y: tableTop - 26, width: W - M * 2, height: 26, color: R(NAVY) });
    text("Skill", col1, tableTop - 17, 10.5, R(WHITE), b);
    text("CEFR Level", col2, tableTop - 17, 10.5, R(WHITE), b);
    text("Score %", col3, tableTop - 17, 10.5, R(WHITE), b);
    text("Status / evidence", stX, tableTop - 17, 10.5, R(WHITE), b);

    const rowH = 34;
    const rows: { skill: string; att: number; lv?: string; sc: number }[] = objective.map((sk) => ({ skill: sk, att: answered[sk] ?? 0, lv: skill[sk], sc: scores[sk] ?? 0 }));
    rows.push({ skill: "speaking", att: 0, sc: 0 });
    rows.forEach((it, i) => {
      const ry = tableTop - rowH * (i + 1);
      if (i % 2 === 1) page.drawRectangle({ x: M, y: ry, width: W - M * 2, height: rowH, color: R([0.975, 0.98, 0.99]) });
      const isSpeaking = it.skill === "speaking";
      const attempted = isSpeaking ? Boolean(row.report_json?.speakingSubmitted) : it.att > 0;
      const my = ry + 12;
      text(SKILL_LABEL[it.skill] ?? it.skill, col1, my, 11, R(INK), b);
      if (isSpeaking) {
        text("—", col2, my, 11, R(MUTED));
        text("—", col3, my, 11, R(MUTED));
        text(attempted ? "Recorded & typed responses reviewed in conversation" : "Not assessed in this sitting", stX, my, 9.5, R(MUTED));
      } else {
        text(attempted ? (it.lv ?? "—") : "—", col2, my, 11, attempted ? R(LEVEL_COLOR[it.lv ?? ""] ?? NAVY) : R(MUTED));
        text(attempted ? `${it.sc}%` : "—", col3, my, 11, R(INK));
        if (attempted) {
          page.drawRectangle({ x: stX, y: my + 4, width: 118, height: 7, color: R(LIGHT) });
          page.drawRectangle({ x: stX, y: my + 4, width: Math.min(118, (it.sc / 100) * 118), height: 7, color: R(LEVEL_COLOR[it.lv ?? ""] ?? NAVY) });
          text(`· ${it.att} question${it.att === 1 ? "" : "s"} answered`, stX + 124, my, 9, R(MUTED));
        } else {
          text("Not attempted in this sitting", stX, my, 9.5, R(MUTED));
        }
      }
      if (i < rows.length - 1) page.drawLine({ start: { x: M, y: ry }, end: { x: W - M, y: ry }, thickness: 0.6, color: R(DIVIDER) });
    });
    y = tableTop - rowH * rows.length - 24;

    // ── Strengths / Focus two columns ──
    const boxW = (W - M * 2 - 16) / 2;
    const boxH = 74;
    const by = y - boxH;
    page.drawRectangle({ x: M, y: by, width: boxW, height: boxH, borderColor: R(DIVIDER), borderWidth: 1, color: R([0.99, 0.99, 1]) });
    page.drawRectangle({ x: M + boxW + 16, y: by, width: boxW, height: boxH, borderColor: R(DIVIDER), borderWidth: 1, color: R([0.99, 0.99, 1]) });
    text("STRENGTHS", M + 14, y - 20, 8, R([0.06, 0.72, 0.51]), b);
    (strengths.length ? strengths.map((s) => SKILL_LABEL[s] ?? s) : ["—"]).slice(0, 2).forEach((s, k) => text(`•  ${s}`, M + 14, y - 38 - k * 15, 10, R(INK)));
    text("FOCUS AREAS", M + boxW + 30, y - 20, 8, R([0.98, 0.45, 0.09]), b);
    (focus.length ? focus.map((s) => SKILL_LABEL[s] ?? s) : ["—"]).slice(0, 2).forEach((s, k) => text(`•  ${s}`, M + boxW + 30, y - 38 - k * 15, 10, R(INK)));
    y = y - boxH - 26;

    // ── Can-do summary ──
    text("CAN-DO SUMMARY", M, y - 8, 8, R(MUTED), b);
    text(`At ${placed}: ${LEVEL_DESCRIPTOR[placed] ?? ""}`, M, y - 26, 10, R(INK));

    // ── Footer band with verification QR ──
    const fh = 116;
    page.drawRectangle({ x: 0, y: 0, width: W, height: fh, color: R(NAVY) });
    page.drawImage(qr, { x: M, y: 32, width: 60, height: 60 });
    text("Verify this report", M + 74, 74, 10, R(WHITE), b);
    text("Scan the QR code or open the link to confirm authenticity.", M + 74, 60, 8.5, R(SOFT));
    text(verifyUrl, M + 74, 47, 7.5, R([0.62, 0.66, 0.76]));
    text(`Candidate: ${row.display_name || "—"} · Student ID: ${studentId} · Issued: ${date}`, M, 22, 8, R(SOFT));
    text("English Wizard · aligned to the Common European Framework of Reference for Languages (CEFR)", M, 10, 8, R(SOFT));

    const bytes = await pdf.save();
    return new NextResponse(Buffer.from(bytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="English-Wizard-Placement-Report-${placed}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF generation failed.";
    return htmlPage(500, "Report could not be generated", msg, "/diagnostic", "Back to assessment");
  }
}

function htmlPage(status: number, title: string, body: string, href: string, cta: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:sans-serif;background:#f4f5fb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="max-width:520px;background:#fff;border-radius:14px;padding:34px;box-shadow:0 8px 24px rgba(15,21,53,.1);text-align:center"><div style="font-size:44px">📄</div><h2 style="margin:10px 0 6px;color:#172033">${title}</h2><p style="color:#64748b;line-height:1.6">${body}</p><a href="${href}" style="display:inline-block;margin-top:14px;padding:11px 22px;background:#6840d6;color:#fff;border-radius:9px;text-decoration:none;font-weight:700">${cta}</a></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
