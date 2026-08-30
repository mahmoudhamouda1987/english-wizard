import { NextResponse } from "next/server";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

/**
 * Public verification lookup (2.0 Parts 88/92).
 * Accepts a credential reference and reports only: valid or not, the issued
 * level and the issue date. No names, no emails, no personal data.
 * Supported references:
 *  - "EW-XXXXXXXXXX" report IDs (B2B results registry, Fluency Passport)
 *  - certificate UUIDs (existing /certificate/[id] scheme)
 */
export async function GET(request: Request) {
  const ref = (new URL(request.url).searchParams.get("id") ?? "").trim();
  if (!ref) return NextResponse.json({ valid: false, error: "Provide the verification reference from the credential." }, { status: 400 });

  try {
    if (ref.startsWith("EW-")) {
      const b2b = await query<{ report_id: string; cefr_level: string; created_at: Date }>(
        "SELECT report_id, cefr_level, created_at FROM b2b_results WHERE report_id=$1 LIMIT 1",
        [ref.toUpperCase()],
      );
      if (b2b.rows.length) {
        const r = b2b.rows[0];
        return NextResponse.json({
          valid: true,
          detail: `${r.cefr_level} assessment report issued ${new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} by English Wizard.`,
        });
      }
    }

    // Certificate lookup by UUID.
    if (/^[0-9a-fA-F-]{36}$/.test(ref)) {
      const cert = await query<{ level: string; issued_at: Date }>(
        "SELECT level, issued_at FROM certificates WHERE id=$1 AND revoked=FALSE LIMIT 1",
        [ref],
      );
      if (cert.rows.length) {
        const c = cert.rows[0];
        return NextResponse.json({
          valid: true,
          detail: `${c.level} certificate issued ${new Date(c.issued_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} by English Wizard.`,
        });
      }
    }

    return NextResponse.json({ valid: false, error: "No matching credential record." }, { status: 404 });
  } catch {
    return NextResponse.json({ valid: false, error: "Verification service unavailable." }, { status: 500 });
  }
}
