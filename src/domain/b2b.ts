import { createHash, randomBytes, randomUUID } from "node:crypto";

/**
 * B2B ASSESSMENT ARCHITECTURE (2.0 contract, Parts 94–96).
 *
 * English Wizard's assessment engine as a potential standalone product:
 * organisations create assessments, candidates receive secure links,
 * results produce verifiable reports, cohorts aggregate for HR analytics.
 * Architecture-first: the tables and contracts exist and are enforced;
 * commercial billing/metering hooks are stubbed behind explicit functions
 * so they can be activated without redesign (Part 151).
 */

export type B2BExamSystem = "LEVELCHECK" | "IELTS" | "CAMBRIDGE";

export interface Organisation {
  id: string;
  name: string;
  contactEmail: string;
  createdAt: string;
}

export interface AssessmentLink {
  id: string;
  organisationId: string;
  label: string;
  system: B2BExamSystem;
  /** Opaque unguessable token given to the candidate — never the row id. */
  linkToken: string;
  status: "OPEN" | "COMPLETED" | "EXPIRED";
  candidateEmail: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface CandidateResult {
  assessmentId: string;
  candidateRef: string;
  cefrLevel: string;
  /** Per-skill CEFR estimates — honest ranges, never fabricated precision. */
  skillProfile: Record<string, { level: string; percent: number }>;
  percent: number;
  reportId: string;
  createdAt: string;
}

export interface CohortStats {
  total: number;
  completed: number;
  inProgress: number;
  levelDistribution: Record<string, number>;
  weakestSkills: Array<{ skill: string; avgPercent: number }>;
  completionRate: number;
}

/** API keys: shown once, stored only as SHA-256. Never log or return the key. */
export function generateApiKey(): { key: string; hash: string } {
  const key = `ewb2b_${randomBytes(24).toString("hex")}`;
  return { key, hash: hashApiKey(key) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

/** Candidate links: opaque, unguessable, decoupled from row ids. */
export function generateLinkToken(): string {
  return randomBytes(18).toString("base64url");
}

/** Part 96 — cohort aggregation without leaking individual private data. */
export function aggregateCohort(
  assessments: Pick<AssessmentLink, "status">[],
  results: Pick<CandidateResult, "cefrLevel" | "skillProfile">[],
): CohortStats {
  const completed = assessments.filter((a) => a.status === "COMPLETED").length;
  const distribution: Record<string, number> = {};
  const skillTotals: Record<string, { sum: number; count: number }> = {};
  for (const r of results) {
    distribution[r.cefrLevel] = (distribution[r.cefrLevel] ?? 0) + 1;
    for (const [skill, v] of Object.entries(r.skillProfile ?? {})) {
      if (!skillTotals[skill]) skillTotals[skill] = { sum: 0, count: 0 };
      skillTotals[skill].sum += Number(v.percent ?? 0);
      skillTotals[skill].count += 1;
    }
  }
  const weakestSkills = Object.entries(skillTotals)
    .map(([skill, t]) => ({ skill, avgPercent: t.count ? Math.round(t.sum / t.count) : 0 }))
    .sort((a, b) => a.avgPercent - b.avgPercent)
    .slice(0, 4);
  return {
    total: assessments.length,
    completed,
    inProgress: assessments.filter((a) => a.status === "OPEN").length,
    levelDistribution: distribution,
    weakestSkills,
    completionRate: assessments.length ? Math.round((completed / assessments.length) * 100) : 0,
  };
}

/** Verification: report IDs are stable, checkable references (Part 88/92). */
export function makeReportId(assessmentId: string): string {
  return `EW-${createHash("sha256").update(assessmentId).digest("hex").slice(0, 10).toUpperCase()}`;
}

/** Usage metering hook (Part 151) — per-organisation counters, ready for billing. */
export function meteringRecord(organisationId: string, action: "assessment_created" | "report_generated") {
  return { organisationId, action, at: new Date().toISOString(), billable: action === "assessment_created" };
}

export function newOrganisationId(): string {
  return randomUUID();
}
