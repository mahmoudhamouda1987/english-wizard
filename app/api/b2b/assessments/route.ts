import { NextResponse } from "next/server";
import { query } from "@/src/infrastructure/database";
import { hashApiKey, generateApiKey, generateLinkToken, makeReportId, newOrganisationId } from "@/src/domain/b2b";

export const dynamic = "force-dynamic";

/**
 * B2B Assessment API (2.0 Parts 94–95).
 *
 * POST /api/b2b/assessments  — organisation creates an assessment link.
 *   Auth: `Authorization: Bearer <api key>` (hashed lookup, never stored raw).
 *   Body: { label, system, candidateEmail? }
 * GET  /api/b2b/assessments  — list the organisation's assessments (same auth).
 * PUT  /api/b2b/assessments  — admin bootstrap: register an organisation, key shown once.
 */

function unauthorised() {
  return NextResponse.json({ error: "A valid B2B API key is required." }, { status: 401 });
}

async function orgFromKey(request: Request): Promise<{ id: string; name: string } | null> {
  const header = request.headers.get("authorization") ?? "";
  const key = header.replace(/^Bearer\s+/i, "").trim();
  if (!key) return null;
  const hash = hashApiKey(key);
  const res = await query<{ id: string; name: string }>(
    "SELECT id, name FROM b2b_organisations WHERE api_key_hash=$1 LIMIT 1",
    [hash],
  );
  return res.rows[0] ?? null;
}

export async function POST(request: Request) {
  try {
    const org = await orgFromKey(request);
    if (!org) return unauthorised();

    const body = (await request.json().catch(() => null)) as { label?: string; system?: string; candidateEmail?: string } | null;
    const label = typeof body?.label === "string" ? body.label.trim() : "";
    const system = body?.system === "IELTS" || body?.system === "CAMBRIDGE" ? body.system : "LEVELCHECK";
    const candidateEmail = typeof body?.candidateEmail === "string" && body.candidateEmail.includes("@") ? body.candidateEmail.trim().slice(0, 200) : null;
    if (label.length < 2) return NextResponse.json({ error: "Provide a short label for the assessment." }, { status: 400 });

    const id = newOrganisationId();
    const linkToken = generateLinkToken();
    await query(
      "INSERT INTO b2b_assessments (id, organisation_id, label, system, link_token, candidate_email) VALUES ($1,$2,$3,$4,$5,$6)",
      [id, org.id, label.slice(0, 160), system, linkToken, candidateEmail],
    );

    return NextResponse.json({
      assessmentId: id,
      label,
      system,
      candidateLink: `/assessment/${linkToken}`,
      reportIdPreview: makeReportId(id),
      note: "The candidate completes the assessment at the link; the organisation receives the report with a verification ID.",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create the assessment right now." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const org = await orgFromKey(request);
    if (!org) return unauthorised();
    const res = await query(
      "SELECT id, label, system, status, candidate_email, created_at, completed_at FROM b2b_assessments WHERE organisation_id=$1 ORDER BY created_at DESC LIMIT 200",
      [org.id],
    );
    return NextResponse.json({ organisation: org.name, assessments: res.rows });
  } catch {
    return NextResponse.json({ error: "Unable to load assessments right now." }, { status: 500 });
  }
}

/** Admin bootstrap: allowlisted admins may register an organisation and receive the key ONCE. */
export async function PUT(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as { name?: string; contactEmail?: string } | null;
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const contactEmail = typeof body?.contactEmail === "string" ? body.contactEmail.trim() : "";
    if (name.length < 2 || !contactEmail.includes("@")) {
      return NextResponse.json({ error: "Organisation name and contact email are required." }, { status: 400 });
    }
    const { key, hash } = generateApiKey();
    const id = newOrganisationId();
    await query(
      "INSERT INTO b2b_organisations (id, name, contact_email, api_key_hash) VALUES ($1,$2,$3,$4)",
      [id, name.slice(0, 160), contactEmail.slice(0, 200), hash],
    );
    return NextResponse.json({ organisationId: id, apiKey: key, warning: "Store this key now — it is never shown again." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to register the organisation right now." }, { status: 500 });
  }
}
