import { NextResponse } from "next/server";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getProfile, upsertProfile } from "@/src/infrastructure/profile-repository";
import {
  CAMBRIDGE_PATHWAY,
  IELTS_PATHWAY,
  pathwayReadiness,
  type ExamPathway,
  type PathwayEvidence,
  type PathwayKind,
  type PathwaySelectionRecord,
} from "@/src/domain/pathways";
import { PROFESSIONAL_LIBRARY } from "@/src/domain/professional-library";

export const dynamic = "force-dynamic";

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
  const [, evidence] = await Promise.all([getProfile(session.learnerId), evidenceFor(session.learnerId)]);
  const examReadiness = (pathway: ExamPathway) => pathwayReadiness(pathway, evidence);
  return NextResponse.json({
    selected: (await getProfile(session.learnerId))?.pathwaySelection ?? null,
    catalog: {
      generalEnglish: { pathway: "GENERAL_ENGLISH", description: "Adaptive general English mastery driven by your English DNA." },
      ielts: { ...IELTS_PATHWAY, readiness: examReadiness(IELTS_PATHWAY), variants: ["ACADEMIC", "GENERAL"], bands: [4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9] },
      cambridge: { ...CAMBRIDGE_PATHWAY, readiness: examReadiness(CAMBRIDGE_PATHWAY), qualifications: ["A2_KEY", "B1_PRELIMINARY", "B2_FIRST", "C1_ADVANCED", "C2_PROFICIENCY"] },
      professional: {
        domains: PROFESSIONAL_LIBRARY.map((domain) => ({
          id: domain.id,
          label: domain.label,
          blurb: domain.blurb,
          trackCount: domain.tracks.length,
          tracks: domain.tracks.map((track) => ({ id: track.id, label: track.label })),
        })),
      },
    },
    disclaimer: "Pathway progress is an internal estimate. English Wizard never grants or implies official IELTS, Cambridge or CEFR certification.",
  });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as {
    pathway?: string; domain?: string; track?: string; target?: string;
    ieltsVariant?: string; bandTarget?: string; cambridgeQualification?: string;
    customField?: string; customRole?: string;
  } | null;
  if (!body?.pathway || !PATHWAY_KINDS.includes(body.pathway as PathwayKind)) {
    return NextResponse.json({ error: `pathway must be one of ${PATHWAY_KINDS.join(", ")}.` }, { status: 400 });
  }
  const profile = await getProfile(session.learnerId);
  if (!profile) return NextResponse.json({ error: "Learner profile not found." }, { status: 404 });
  const selection: PathwaySelectionRecord = {
    pathway: body.pathway as PathwayKind,
    ...(body.domain ? { domain: body.domain } : {}),
    ...(body.track ? { track: body.track } : {}),
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
