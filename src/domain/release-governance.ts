import type { ContentGovernanceRecord, HumanReviewGate, EvaluationCase } from "./content-governance";

export interface ReviewQueueItem {
  id: string;
  contentId: string;
  kind: "CONTENT" | "AI_EVALUATION" | "ASSESSMENT" | "SAFETY";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assignedRole: HumanReviewGate["reviewerRole"];
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
  blocking: boolean;
}

export interface ReleaseReadiness {
  contentBlocked: number;
  humanReviewPending: number;
  evaluationCoverage: number;
  securityChecksPassed: boolean;
  accessibilityChecksPassed: boolean;
  aiProviderConfigured: boolean;
}

export function buildReviewQueue(records: ContentGovernanceRecord[], gates: HumanReviewGate[], evaluations: EvaluationCase[]): ReviewQueueItem[] {
  const queue: ReviewQueueItem[] = [];
  for (const record of records) {
    if (record.review !== "APPROVED" || !record.safetyChecked || !record.answerChecked) {
      const gate = gates.find((item) => item.contentId === record.contentId);
      queue.push({ id: `content-${record.contentId}`, contentId: record.contentId, kind: "CONTENT", priority: record.rights === "PENDING_REVIEW" ? "HIGH" : "MEDIUM", assignedRole: gate?.reviewerRole ?? "CURRICULUM_REVIEWER", status: gate?.status === "APPROVED" ? "APPROVED" : "PENDING", blocking: record.review !== "APPROVED" });
    }
  }
  for (const evaluation of evaluations) {
    queue.push({ id: `eval-${evaluation.id}`, contentId: evaluation.id, kind: "AI_EVALUATION", priority: "HIGH", assignedRole: "CURRICULUM_REVIEWER", status: "PENDING", blocking: true });
  }
  return queue;
}

export function isReleaseReady(readiness: ReleaseReadiness): boolean {
  return readiness.contentBlocked === 0 && readiness.humanReviewPending === 0 && readiness.evaluationCoverage >= 0.9 && readiness.securityChecksPassed && readiness.accessibilityChecksPassed && readiness.aiProviderConfigured;
}
