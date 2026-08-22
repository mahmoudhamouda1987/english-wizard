import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { getLearnerState } from "@/src/infrastructure/learner-repository";
import { query } from "@/src/infrastructure/database";

export const dynamic = "force-dynamic";

interface CertRow { id: string; display_name: string; level: string; overall_percent: number; issued_at: Date }

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const certs = await query<CertRow>(
    `SELECT id, display_name, level, overall_percent, issued_at FROM certificates
     WHERE learner_id = $1 AND revoked = FALSE ORDER BY issued_at DESC LIMIT 1`,
    [session.learnerId],
  );
  return NextResponse.json({ certificate: certs.rows[0] ?? null });
}

export async function POST() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const [profile, state] = await Promise.all([getProfile(session.learnerId), getLearnerState(session.learnerId)]);
  const mastery = state?.mastery ?? [];
  if (mastery.length < 3) {
    return NextResponse.json({ error: "Complete more activities first — at least three skill areas need evidence." }, { status: 400 });
  }
  const overallPercent = Math.round(mastery.reduce((s, m) => s + m.score, 0) / mastery.length);
  const level = profile?.englishDna?.overallLevel ?? "A1";

  const id = randomUUID();
  const displayName = profile?.displayName ?? session.email.split("@")[0];
  await query(
    `INSERT INTO certificates (id, learner_id, display_name, level, overall_percent) VALUES ($1,$2,$3,$4,$5)`,
    [id, session.learnerId, displayName, level, overallPercent],
  );
  return NextResponse.json({ id, level, overallPercent, verifyUrl: `/certificate/${id}` }, { status: 201 });
}
