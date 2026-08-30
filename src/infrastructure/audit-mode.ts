/* ═══════════════════════════════════════════════════════════════════════════
 * AUDIT MODE (spec Parts 92–99).
 *
 * A developer-only audit layer over the ONE production codebase. When enabled
 * by secure environment configuration, the same app gains: level overrides,
 * trial simulation, assessment resets, variant selection and seeded test
 * personas — so an auditor can repeat LevelCheck, test locked/unlocked states
 * and walk every product without changing emails.
 *
 * SECURITY (Part 96): audit mode depends ONLY on environment configuration —
 * AUDIT_MODE=true AND a non-production runtime. It can never be enabled by a
 * URL parameter, header or client flag, and production builds are hard-locked.
 * ═══════════════════════════════════════════════════════════════════════════ */

/** True only when the runtime explicitly opts in AND is not production. */
export function isAuditMode(): boolean {
  return process.env.AUDIT_MODE === "true" && process.env.NODE_ENV !== "production";
}

/** The seeded audit personas (Part 98) — created idempotently by the seed action. */
export interface AuditPersona {
  email: string;
  displayName: string;
  level: string;
  note: string;
}

const PERSONA_PASSWORD = "AuditPass123!";

export const AUDIT_PERSONAS: AuditPersona[] = [
  { email: "audit-prea1@englishwizard.dev", displayName: "Audit Pre-A1", level: "Pre-A1", note: "Foundations" },
  { email: "audit-a1@englishwizard.dev", displayName: "Audit A1", level: "A1", note: "Survival" },
  { email: "audit-a2@englishwizard.dev", displayName: "Audit A2", level: "A2", note: "Everyday independence" },
  { email: "audit-b1@englishwizard.dev", displayName: "Audit B1", level: "B1", note: "Confident communication" },
  { email: "audit-b2@englishwizard.dev", displayName: "Audit B2", level: "B2", note: "Complex communication" },
  { email: "audit-c1@englishwizard.dev", displayName: "Audit C1", level: "C1", note: "Advanced precision" },
  { email: "audit-c2@englishwizard.dev", displayName: "Audit C2", level: "C2", note: "Mastery" },
  { email: "audit-ielts-55@englishwizard.dev", displayName: "Audit IELTS 5.5", level: "B1", note: "IELTS 5.5 candidate — target 6.5" },
  { email: "audit-ielts-70@englishwizard.dev", displayName: "Audit IELTS 7.0", level: "C1", note: "IELTS 7.0 candidate — target 7.0" },
  { email: "audit-ielts-80@englishwizard.dev", displayName: "Audit IELTS 8.0", level: "C2", note: "IELTS 8.0 candidate — target 8.0" },
  { email: "audit-business@englishwizard.dev", displayName: "Audit Business", level: "B2", note: "Business English learner" },
  { email: "audit-fluency@englishwizard.dev", displayName: "Audit Fluency", level: "B1", note: "Fluency Track entrant" },
  { email: "audit-cambridge-b2@englishwizard.dev", displayName: "Audit Cambridge B2", level: "B2", note: "B2 First candidate" },
  { email: "audit-cambridge-c1@englishwizard.dev", displayName: "Audit Cambridge C1", level: "C1", note: "C1 Advanced candidate" },
];

export const AUDIT_PERSONA_PASSWORD = PERSONA_PASSWORD;

/** The seven CEFR bands accepted by the level-override control (Part 95). */
export const AUDIT_LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type AuditLevel = (typeof AUDIT_LEVELS)[number];

export function isAuditLevel(value: unknown): value is AuditLevel {
  return typeof value === "string" && (AUDIT_LEVELS as readonly string[]).includes(value);
}
