import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/infrastructure/admin-guard";
import { query } from "@/src/infrastructure/database";
import { LEVELQUEST_BANK, CEFR_ORDER, VARIANT_THEMES, type SkillKey } from "@/src/domain/levelquest";

export const dynamic = "force-dynamic";

interface ItemStat {
  itemId: string;
  attempts: number;
  correct: number;
  successRate: number;
  skill: SkillKey;
  cefr: string;
  variant: number;
  subskill: string;
  prompt: string;
}

/**
 * Question-bank performance foundation (Part 33): per-item usage, success rate
 * and problematic-question flags computed from completed LevelQuest sessions,
 * for future psychometric calibration. Fails closed via requireAdmin.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;

  try {
    const sessions = await query<{ payload: { answers?: Record<string, { correct?: boolean }>; variant?: number } }>(
      `SELECT payload FROM levelquest_sessions WHERE status = 'COMPLETE' ORDER BY completed_at DESC NULLS LAST LIMIT 500`,
    );

    const attempts = new Map<string, { total: number; correct: number }>();
    const variantCounts = new Map<number, number>();
    let sittings = 0;
    let answeredTotal = 0;
    let speakingSubmittedSittings = 0;

    for (const row of sessions.rows) {
      const payload = row.payload ?? {};
      if (!payload.answers) continue;
      sittings += 1;
      variantCounts.set(payload.variant ?? 0, (variantCounts.get(payload.variant ?? 0) ?? 0) + 1);
      let anySpeaking = false;
      for (const [itemId, graded] of Object.entries(payload.answers)) {
        answeredTotal += 1;
        const stat = attempts.get(itemId) ?? { total: 0, correct: 0 };
        stat.total += 1;
        if (graded?.correct) stat.correct += 1;
        if (itemId.startsWith("lq-10")) anySpeaking = true;
        attempts.set(itemId, stat);
      }
      if (anySpeaking) speakingSubmittedSittings += 1;
    }

    const byId = new Map(LEVELQUEST_BANK.map((i) => [i.id, i]));
    const stats: ItemStat[] = [];
    for (const [itemId, stat] of attempts) {
      const item = byId.get(itemId);
      if (!item) continue;
      stats.push({
        itemId,
        attempts: stat.total,
        correct: stat.correct,
        successRate: stat.total ? Math.round((stat.correct / stat.total) * 100) : 0,
        skill: item.skill,
        cefr: item.cefr,
        variant: item.variant,
        subskill: item.subskill,
        prompt: item.prompt,
      });
    }
    stats.sort((a, b) => b.attempts - a.attempts);

    // Problematic questions: very hard or very easy with meaningful exposure.
    const problematic = stats.filter((s) => s.attempts >= 10 && (s.successRate < 30 || s.successRate > 95));

    const cefrCoverage = CEFR_ORDER.map((level) => ({
      level,
      bankItems: LEVELQUEST_BANK.filter((i) => i.cefr === level).length,
      attempted: stats.filter((s) => s.cefr === level).reduce((sum, s) => sum + s.attempts, 0),
    }));

    return NextResponse.json({
      sittings,
      answeredTotal,
      avgAnsweredPerSitting: sittings ? Math.round((answeredTotal / sittings) * 10) / 10 : 0,
      speakingSubmissionRate: sittings ? Math.round((speakingSubmittedSittings / sittings) * 100) : 0,
      bankSize: LEVELQUEST_BANK.length,
      variantThemes: VARIANT_THEMES,
      variantDistribution: Array.from(variantCounts.entries()).map(([variant, count]) => ({ variant, theme: VARIANT_THEMES[(variant - 1) % 15] ?? "—", sittings: count })),
      cefrCoverage,
      topPresented: stats.slice(0, 40),
      problematic,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Unable to compute question stats." }, { status: 500 });
  }
}
