import { NextResponse } from "next/server";
import { query } from "@/src/infrastructure/database";
import { CEFR_ORDER } from "@/src/domain/levelquest";
import { reportReference } from "@/src/domain/placement-report";

export const dynamic = "force-dynamic";

/**
 * Public verification page for a placement report.
 * Accessed by scanning the QR code on the PDF (uses the unguessable report UUID).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get("r") ?? "").trim();
  // Reject malformed references before hitting the database (UUID cast would raise).
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return notFoundPage();
  }

  let rows: Awaited<ReturnType<typeof query>>["rows"];
  try {
    const r = await query<{
      level: string; confidence: string; variant: number; created_at: string;
      display_name: string; student_id: string | null;
      skill_profile: Record<string, string>;
    }>(
      `SELECT pr.level, pr.confidence, pr.variant, pr.created_at,
              COALESCE(ua.display_name, lp.display_name) AS display_name, l.student_id, pr.skill_profile
       FROM placement_reports pr
       JOIN learners l ON l.id = pr.learner_id
       LEFT JOIN user_accounts ua ON ua.learner_id = l.id
       LEFT JOIN learner_profiles lp ON lp.learner_id = l.id
       WHERE pr.id = $1::uuid`,
    [id],
  );

    rows = r.rows;
  } catch {
    return notFoundPage();
  }

  if (!rows || !rows[0]) return notFoundPage();

  const row = rows[0];
  const isPlace = CEFR_ORDER.includes(row.level as (typeof CEFR_ORDER)[number]);
  const date = new Date(row.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const reportRef = reportReference(row.id);

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Report Verification — English Wizard</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f4f5fb;margin:0;padding:24px">
<div style="max-width:620px;margin:0 auto;border-top:3px solid #6840d6">
  <div style="background:#0f1535;color:#fff;border-radius:0;padding:22px 28px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;border-radius:9px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px">🧙</div>
      <div><div style="font-weight:800;font-size:16px;letter-spacing:.02em">ENGLISH WIZARD</div><div style="font-size:11px;opacity:.7">Personalised English Learning</div></div>
    </div>
    <div style="text-align:right"><div style="font-weight:800;font-size:13px">REPORT VERIFICATION</div><div style="font-size:10.5px;opacity:.7">CEFR-ALIGNED ASSESSMENT</div></div>
  </div>
  <div style="background:#fff;border-radius:0 0 4px 4px;padding:30px 28px">
    <div style="display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:10px;background:#ecfdf5;border:1px solid #a7f3d0;margin-bottom:22px">
      <div style="font-size:20px">✓</div>
      <div><div style="font-weight:800;color:#065f46">Report is genuine</div><div style="font-size:12.5px;color:#047857">This is a valid English Wizard CEFR-aligned English proficiency placement report.</div></div>
    </div>
    <div style="text-align:center;padding:8px 0 20px">
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#64748b">Overall English Proficiency</div>
      <div style="font-size:58px;font-weight:900;color:#6840d6">${row.level}</div>
      <div style="color:#475569">${row.confidence} confidence</div>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #eef0f7">Candidate</td><td style="padding:9px 0;font-weight:700;text-align:right;border-bottom:1px solid #eef0f7">${row.display_name || "—"}</td></tr>
      <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #eef0f7">Student ID</td><td style="padding:9px 0;font-weight:700;text-align:right;border-bottom:1px solid #eef0f7">${row.student_id ?? "—"}</td></tr>
      <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #eef0f7">Report ID</td><td style="padding:9px 0;font-weight:700;text-align:right;border-bottom:1px solid #eef0f7">${reportRef}</td></tr>
      <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #eef0f7">Assessment date</td><td style="padding:9px 0;font-weight:700;text-align:right;border-bottom:1px solid #eef0f7">${date}</td></tr>
      <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #eef0f7">Assessment method</td><td style="padding:9px 0;font-weight:700;text-align:right;border-bottom:1px solid #eef0f7">Adaptive CEFR-Aligned Assessment</td></tr>
    </table>
    <p style="margin-top:18px;font-size:12.5px;color:#64748b;line-height:1.6">English proficiency is referenced to the Common European Framework of Reference for Languages (CEFR). ${isPlace && row.level ? `The candidate's assessed level is <strong>${row.level}</strong>.` : ""}</p>
  </div>
</div>
</body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
  );
}

function notFoundPage(): NextResponse {
  return new NextResponse(
    `<!doctype html><html><body style="font-family:sans-serif;background:#f4f5fb;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="max-width:520px;background:#fff;border-radius:14px;padding:40px;text-align:center;box-shadow:0 8px 24px rgba(15,21,53,.1)"><div style="font-size:46px">🚫</div><h2 style="color:#172033">Report not found</h2><p style="color:#64748b">This verification link does not correspond to a valid English Wizard placement report.</p></div></body></html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
