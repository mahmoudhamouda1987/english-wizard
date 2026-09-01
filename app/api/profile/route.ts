import { NextResponse } from "next/server";
import type { LearnerProfile } from "@/src/domain/profile";
import { getProfile, upsertProfile } from "@/src/infrastructure/profile-repository";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { generateStudentId } from "@/src/domain/trial";
import { CATALOGUE_PRODUCTS, productAccessible, type CatalogueProduct } from "@/src/domain/entitlements";
import { resolveGatingTier } from "@/src/infrastructure/usage-guard";

function validTargetLevel(value: unknown): value is LearnerProfile["targetLevel"] {
  return typeof value === "string" && ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].includes(value);
}

/** Profile-picture payloads: a bounded image data URL (uploaded photo or preset avatar SVG). */
const MAX_AVATAR_BYTES = 500_000;
const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/;

function validAvatar(value: unknown): value is { url: string; kind: "photo" | "avatar" } {
  return (
    typeof value === "object" && value !== null &&
    typeof (value as { url?: unknown }).url === "string" &&
    (value as { url: string }).url.length <= MAX_AVATAR_BYTES &&
    AVATAR_PATTERN.test((value as { url: string }).url) &&
    ((value as { kind?: unknown }).kind === "photo" || (value as { kind?: unknown }).kind === "avatar")
  );
}

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ profile: await getProfile(session.learnerId) });
}

export async function POST(request: Request) {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  const dailyMinutes = Number(body.dailyMinutes ?? 20);
  if (!Number.isInteger(dailyMinutes) || dailyMinutes < 5 || dailyMinutes > 180) {
    return NextResponse.json({ error: "dailyMinutes must be between 5 and 180." }, { status: 400 });
  }
  const targetLevel = validTargetLevel(body.targetLevel) ? body.targetLevel : "B1";
  const existing = await getProfile(session.learnerId);

  // Current Path switch (learning-paths IA): allowed only for products the
  // learner is entitled to — locked products are preview/explore-only. In
  // audit mode every product stays selectable so reviewers can walk all paths.
  let activeProduct: CatalogueProduct | null = null;
  if (body.activeProduct !== undefined) {
    if (typeof body.activeProduct !== "string" || !(CATALOGUE_PRODUCTS as string[]).includes(body.activeProduct)) {
      return NextResponse.json({ error: "activeProduct must be one of the five catalogue products." }, { status: 400 });
    }
    const tier = await resolveGatingTier(session.learnerId);
    if (!productAccessible(tier, body.activeProduct as CatalogueProduct)) {
      return NextResponse.json({ error: "This path is not part of your subscription. Explore it first, then choose it from Learning Paths." }, { status: 403 });
    }
    activeProduct = body.activeProduct as CatalogueProduct;
  }

  // Avatar update (standalone use is fine — the other profile fields are
  // optional in the body and fall back to current values).
  let avatarUrl = existing?.avatarUrl ?? null;
  let avatarKind = existing?.avatarKind ?? "initials";
  if (body.avatar === "RESET") {
    avatarUrl = null;
    avatarKind = "initials";
  } else if (validAvatar(body.avatar)) {
    avatarUrl = body.avatar.url;
    avatarKind = body.avatar.kind;
  } else if (body.avatar !== undefined) {
    return NextResponse.json({ error: "avatar must be RESET or an image data URL under 500 KB (png, jpeg, webp or svg)." }, { status: 400 });
  }

  const profile = await upsertProfile({
    learnerId: session.learnerId,
    displayName: typeof body.displayName === "string" && body.displayName.trim() ? body.displayName.trim() : session.displayName,
    nativeLanguage: typeof body.nativeLanguage === "string" && body.nativeLanguage.trim() ? body.nativeLanguage.trim() : "Arabic",
    targetLevel,
    dailyMinutes,
    goals: Array.isArray(body.goals) ? body.goals.filter((item): item is string => typeof item === "string").slice(0, 8) : (existing?.goals ?? []),
    avatarUrl,
    avatarKind,
    englishDna: existing?.englishDna ?? { overallLevel: "Not assessed", strengths: [], focusAreas: [], preferredSkills: [], confidence: 0 },
    updatedAt: new Date().toISOString(),
    activeProduct: activeProduct ?? existing?.activeProduct,
  });

  // Assign an idempotent Student ID (EW-YY-XXXXXX, e.g. EW-26-7F4K82) on first
  // profile setup. Random unambiguous suffix with a collision re-roll loop —
  // every learner receives a UNIQUE id (never a placeholder constant).
  let studentId: string | null = null;
  const idRow = await query<{ student_id: string | null }>(`SELECT student_id FROM learners WHERE id = $1::uuid`, [session.learnerId]);
  if (idRow.rows.length) {
    if (!idRow.rows[0].student_id) {
      for (let attempt = 0; attempt < 6 && !studentId; attempt++) {
        const candidate = generateStudentId();
        const clash = await query<{ student_id: string }>(`SELECT student_id FROM learners WHERE student_id = $1 LIMIT 1`, [candidate]);
        if (clash.rows.length) continue;
        const assigned = await query<{ student_id: string }>(
          `UPDATE learners SET student_id = $2, updated_at = NOW() WHERE id = $1::uuid AND student_id IS NULL RETURNING student_id`,
          [session.learnerId, candidate],
        );
        if (assigned.rows.length) studentId = assigned.rows[0].student_id;
      }
      if (!studentId) studentId = idRow.rows[0].student_id; // concurrent writer won; fall through to their value
      if (!studentId) {
        const refreshed = await query<{ student_id: string | null }>(`SELECT student_id FROM learners WHERE id = $1::uuid`, [session.learnerId]);
        studentId = refreshed.rows[0]?.student_id ?? null;
      }
    } else {
      studentId = idRow.rows[0].student_id;
    }
  }

  return NextResponse.json({ profile, studentId });
}
