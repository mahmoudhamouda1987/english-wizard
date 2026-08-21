import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";

const purposes = new Set(["diagnostic", "speaking_feedback", "pronunciation", "mission"]);

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [prefs, consents] = await Promise.all([
    query("SELECT analytics, personalized_ai, voice_processing, voice_retention_days, share_for_human_review, updated_at FROM learner_privacy_preferences WHERE learner_id=$1", [user.learnerId]),
    query("SELECT id, purpose, provider_disclosure, consented, consented_at, revoked_at, deletion_requested_at FROM voice_consents WHERE learner_id=$1 ORDER BY created_at DESC", [user.learnerId]),
  ]);
  return NextResponse.json({
    preferences: prefs.rows[0] ?? { analytics: true, personalized_ai: true, voice_processing: false, voice_retention_days: 7, share_for_human_review: false },
    consents: consents.rows,
  });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "JSON body required." }, { status: 400 });
  if (body.preferences && typeof body.preferences === "object") {
    const p = body.preferences as Record<string, unknown>;
    const analytics = p.analytics !== false;
    const personalizedAi = p.personalizedAi !== false;
    const voiceProcessing = p.voiceProcessing === true;
    const retention = Number(p.voiceRetentionDays ?? 7);
    const share = p.shareForHumanReview === true;
    if (!Number.isInteger(retention) || retention < 0 || retention > 365) return NextResponse.json({ error: "voiceRetentionDays must be 0–365." }, { status: 400 });
    await query(`INSERT INTO learner_privacy_preferences (learner_id, analytics, personalized_ai, voice_processing, voice_retention_days, share_for_human_review, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      ON CONFLICT (learner_id) DO UPDATE SET analytics=EXCLUDED.analytics, personalized_ai=EXCLUDED.personalized_ai, voice_processing=EXCLUDED.voice_processing, voice_retention_days=EXCLUDED.voice_retention_days, share_for_human_review=EXCLUDED.share_for_human_review, updated_at=NOW()`,
      [user.learnerId, analytics, personalizedAi, voiceProcessing, retention, share]);
  }
  if (typeof body.purpose === "string" && purposes.has(body.purpose)) {
    const consented = body.consented === true;
    const disclosure = typeof body.providerDisclosure === "string" ? body.providerDisclosure.slice(0, 1000) : "Voice data may be processed by configured speech/AI providers for the stated learning purpose.";
    await query(`INSERT INTO voice_consents (id, learner_id, purpose, provider_disclosure, consented, consented_at, revoked_at, deletion_requested_at)
      VALUES ($1,$2,$3,$4,$5,CASE WHEN $5 THEN NOW() ELSE NULL END,CASE WHEN $5 THEN NULL ELSE NOW() END,NULL)`,
      [randomUUID(), user.learnerId, body.purpose, disclosure, consented]);
  }
  return GET();
}
