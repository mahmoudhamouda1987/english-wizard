import { createHash } from "node:crypto";

export type ExperimentStatus = "DRAFT" | "RUNNING" | "COMPLETED" | "STOPPED";

export interface ExperimentRecord {
  id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  control: string;
  variants: string[];
  primaryLearningMetric: string;
  guardrailMetrics: string[];
}

const VALID_TRANSITIONS: Record<ExperimentStatus, ExperimentStatus[]> = {
  DRAFT: ["RUNNING"],
  RUNNING: ["COMPLETED", "STOPPED"],
  COMPLETED: [],
  STOPPED: [],
};

export function canTransition(from: ExperimentStatus, to: ExperimentStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export function assignVariant(learnerId: string, experiment: Pick<ExperimentRecord, "id" | "control" | "variants">): string {
  const buckets = [experiment.control, ...experiment.variants];
  const digest = createHash("sha256").update(`${experiment.id}:${learnerId}`).digest();
  return buckets[digest[0] % buckets.length];
}

export function validateExperiment(input: Partial<ExperimentRecord>): { ok: true } | { ok: false; error: string } {
  if (!input.name || input.name.trim().length < 3) return { ok: false, error: "Experiment name is required." };
  if (!input.hypothesis || input.hypothesis.trim().length < 10) return { ok: false, error: "A testable hypothesis of at least 10 characters is required." };
  if (!input.control) return { ok: false, error: "Control variant is required." };
  const variants = input.variants ?? [];
  if (variants.length < 1) return { ok: false, error: "At least one treatment variant is required." };
  if ([input.control, ...variants].some((v) => typeof v !== "string" || !v.trim())) return { ok: false, error: "Variant names must be non-empty strings." };
  if (new Set([input.control, ...variants]).size !== variants.length + 1) return { ok: false, error: "Variant names must be unique." };
  if (!input.primaryLearningMetric) return { ok: false, error: "A primary learning metric is required." };
  return { ok: true };
}
