import type { EvidenceOutcome, LearningEvidence } from "./learning-evidence";

export interface OutcomeSnapshot {
  learnerId: string;
  capabilityId: string;
  baselineScore: number | null;
  currentScore: number | null;
  scoreDelta: number | null;
  evidenceCount: number;
  correctRate: number;
  transferRate: number;
  lastEvidenceAt: string | null;
}

export interface ExperimentDefinition {
  id: string;
  name: string;
  hypothesis: string;
  variants: string[];
  primaryMetric: "SCORE_DELTA" | "TRANSFER_RATE" | "RETENTION" | "TIME_TO_MASTERY";
  enabled: boolean;
}

export interface Entitlement {
  feature: "CORE_CURRICULUM" | "AI_TEACHER" | "SPEAKING_COACH" | "EXAM_PATHWAY" | "DEEP_STUDY";
  enabled: boolean;
  reason: string;
}

export function outcomeSnapshots(learnerId: string, evidence: LearningEvidence[]): OutcomeSnapshot[] {
  const groups = new Map<string, LearningEvidence[]>();
  for (const item of evidence) {
    for (const capability of item.capabilityIds.length ? item.capabilityIds : [item.objectiveId]) {
      const items = groups.get(capability) ?? [];
      items.push(item);
      groups.set(capability, items);
    }
  }
  return [...groups.entries()].map(([capabilityId, items]) => {
    const chronological = [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const baselineScore = chronological[0]?.score ?? null;
    const currentScore = chronological.at(-1)?.score ?? null;
    const correctRate = chronological.filter((item) => item.outcome === "CORRECT").length / Math.max(1, chronological.length);
    const transferRate = chronological.filter((item) => item.context === "TRANSFER").length / Math.max(1, chronological.length);
    return {
      learnerId,
      capabilityId,
      baselineScore,
      currentScore,
      scoreDelta: baselineScore === null || currentScore === null ? null : currentScore - baselineScore,
      evidenceCount: chronological.length,
      correctRate,
      transferRate,
      lastEvidenceAt: chronological.at(-1)?.createdAt ?? null,
    };
  });
}

export function retentionRate(evidence: LearningEvidence[], windowDays = 14): number {
  const cutoff = Date.now() - windowDays * 86_400_000;
  const recent = evidence.filter((item) => Date.parse(item.createdAt) >= cutoff);
  if (!recent.length) return 0;
  return recent.filter((item) => item.outcome === ("CORRECT" satisfies EvidenceOutcome)).length / recent.length;
}

export function canAccess(entitlements: Entitlement[], feature: Entitlement["feature"]): boolean {
  return entitlements.some((item) => item.feature === feature && item.enabled);
}

export const DEFAULT_ENTITLEMENTS: Entitlement[] = [
  { feature: "CORE_CURRICULUM", enabled: true, reason: "Core learning path" },
  { feature: "AI_TEACHER", enabled: true, reason: "Adaptive teacher capability" },
  { feature: "SPEAKING_COACH", enabled: true, reason: "Speaking practice capability" },
  { feature: "EXAM_PATHWAY", enabled: false, reason: "Requires dedicated exam pathway entitlement" },
  { feature: "DEEP_STUDY", enabled: true, reason: "Deep learning session" },
];

export const CORE_EXPERIMENTS: ExperimentDefinition[] = [
  { id: "next-action-v1", name: "Next Best Action", hypothesis: "Evidence-weighted recommendations improve capability growth.", variants: ["control", "evidence_weighted"], primaryMetric: "SCORE_DELTA", enabled: false },
  { id: "transfer-v1", name: "Transfer frequency", hypothesis: "More unfamiliar-context production improves transfer rate.", variants: ["standard", "transfer_heavy"], primaryMetric: "TRANSFER_RATE", enabled: false },
];
