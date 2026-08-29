import { NextResponse } from "next/server";
import { requireAdmin } from "@/src/infrastructure/admin-guard";
import { validateScenes, hasCriticalSceneIssues } from "@/src/domain/scene-qa";
import { MVP_LESSONS, MVP_OBJECTIVES } from "@/src/domain/curriculum";
import { PROFESSIONAL_LIBRARY } from "@/src/domain/professional-library";
import { listQualifications } from "@/src/domain/cambridge";
import { READING_SETS, WRITING_TASKS, SPEAKING_CARDS } from "@/src/domain/ielts";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;
  const sceneReport = validateScenes();
  return NextResponse.json({
    overallHealthy: !hasCriticalSceneIssues(sceneReport),
    curriculum: { lessons: MVP_LESSONS.length, objectives: MVP_OBJECTIVES.length },
    scenes: { total: sceneReport.totalScenes, passed: sceneReport.passedScenes, failed: sceneReport.failedScenes, issues: sceneReport.summary },
    professionalLibrary: { domains: PROFESSIONAL_LIBRARY.length, totalTracks: PROFESSIONAL_LIBRARY.reduce((sum, domain) => sum + domain.tracks.length, 0) },
    ielts: { readingBanks: READING_SETS.length, writingTasks: WRITING_TASKS.length, speakingCards: SPEAKING_CARDS.length },
    cambridge: { qualifications: listQualifications().length },
    sceneIssueSamples: sceneReport.issues.slice(0, 10),
  }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
