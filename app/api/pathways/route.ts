import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getProfile, upsertProfile } from "@/src/infrastructure/profile-repository";
import {
  CAMBRIDGE_PATHWAY,
  IELTS_PATHWAY,
  buildProfessionalPathway,
  pathwayReadiness,
  type ExamPathway,
  type PathwayEvidence,
  type PathwayKind,
  type PathwaySelectionRecord,
  type ProfessionalDomain,
  type ProfessionalTrack,
} from "@/src/domain/pathways";

export const dynamic = "force-dynamic";

const PROFESSIONAL_DOMAINS: ProfessionalDomain[] = ["BUSINESS", "ACADEMIC", "TECHNOLOGY", "HEALTHCARE", "HOSPITALITY", "CUSTOMER_SERVICE", "LEADERSHIP"];
const PROFESSIONAL_TRACKS: ProfessionalTrack[] = ["WORKPLACE_COMMUNICATION", "MEETINGS", "PRESENTATIONS", "MANAGEMENT", "ACADEMIC", "INTERVIEW"];
const PATHWAY_KINDS: PathwayKind[] = ["GENERAL_ENGLISH", "PROFESSIONAL", "IELTS", "CAMBRIDGE"];

async function evidenceFor(learnerId: string): Promise<PathwayEvidence[]> {
  const result = await query<{ payload: { capabilityIds?: string[]; score?: number; context?: string; modality?: string } }>(
    `SELECT payload FROM learning_events WHERE learner_id = $1 AND event_type = 'LEARNING_EVIDENCE' ORDER BY occurred_at DESC LIMIT 200`,
    [learnerId],
  );
  return result.rows.map((row) => ({
    capabilityId: row.payload.capabilityIds?.[0] ?? "",
    skill: (row.payload.modality ?? "").toLowerCase(),
    score: Number(row.payload.score ?? 0),
    transfer: row.payload.context === "TRANSFER" || row.payload.context === "UNFAMILIAR",
  }));
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const [profile, evidence] = await Promise.all([getProfile(session.learnerId), evidenceFor(session.learnerId)]);
  const professional = PROFESSIONAL_DOMAINS.map((domain) => buildProfessionalPathway(domain, profile?.targetLevel ?? "B1", [`${domain.toLowerCase()}-communication`]));
  const examReadiness = (pathway: ExamPathway) => pathwayReadiness(pathway, evidence);
  return NextResponse.json({
    selected: profile?.pathwaySelection ?? null,
    catalog: {
      generalEnglish: { pathway: "GENERAL_ENGLISH", description: "Adaptive general English mastery driven by your English DNA." },
      ielts: { ...IELTS_PATHWAY, readiness: examReadiness(IELTS_PATHWAY) },
      cambridge: { ...CAMBRIDGE_PATHWAY, readiness: examReadiness(CAMBRIDGE_PATHWAY) },
      professional: professional.map((pathway) => ({ ...pathway, readiness: pathwayReadiness(pathway, evidence) })),
      options: { domains: PROFESSIONAL_DOMAINS, tracks: PROFESSIONAL_TRACKS },
    },
    disclaimer: "Pathway progress is an internal estimate. English Wizard never grants or implies official IELTS, Cambridge or CEFR certification.",
  });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { pathway?: string; domain?: string; track?: string; target?: string } | null;
  if (!body?.pathway || !PATHWAY_KINDS.includes(body.pathway as PathwayKind)) {
    return NextResponse.json({ error: `pathway must be one of ${PATHWAY_KINDS.join(", ")}.` }, { status: 400 });
  }
  if (body.domain && !PROFESSIONAL_DOMAINS.includes(body.domain as ProfessionalDomain)) {
    return NextResponse.json({ error: "Unknown professional domain." }, { status: 400 });
  }
  if (body.track && !PROFESSIONAL_TRACKS.includes(body.track as ProfessionalTrack)) {
    return NextResponse.json({ error: "Unknown professional track." }, { status: 400 });
  }
  const profile = await getProfile(session.learnerId);
  if (!profile) return NextResponse.json({ error: "Learner profile not found." }, { status: 404 });
  const selection: PathwaySelectionRecord = {
    pathway: body.pathway as PathwayKind,
    ...(body.domain ? { domain: body.domain as ProfessionalDomain } : {}),
    ...(body.track ? { track: body.track as ProfessionalTrack } : {}),
    ...(typeof body.target === "string" && body.target.trim() ? { target: body.target.trim().slice(0, 80) } : {}),
    selectedAt: new Date().toISOString(),
  };
  const updated = await upsertProfile({ ...profile, pathwaySelection: selection });
  await query(
    `INSERT INTO audit_events (id, learner_id, actor_id, action, entity_type, entity_id, metadata)
     VALUES ($1, $2::uuid, $2::uuid, 'PATHWAY_SELECTED', 'learner_profile', $2::text, $3::jsonb)`,
    [crypto.randomUUID(), session.learnerId, JSON.stringify(selection)],
  );
  return NextResponse.json({ selection, profile: { pathwaySelection: updated.pathwaySelection } }, { status: 201 });
}
