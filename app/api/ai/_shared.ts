import { randomUUID } from "node:crypto";
import { currentUser } from "@/src/infrastructure/auth";
import { query } from "@/src/infrastructure/database";
import { getProfile } from "@/src/infrastructure/profile-repository";
import { getLearnerState } from "@/src/infrastructure/learner-repository";
import { buildEvidence, type EvidenceModality } from "@/src/domain/learning-evidence";
import { routeAITask, type AITask, type ModelRoute } from "@/src/domain/ai-operations";
import { rankKnowledgeDocuments, type RagRights } from "@/src/domain/rag";
import type { LearningLevel } from "@/src/domain/advanced-learning";

export async function requireLearnerContext() {
  const session = await currentUser();
  if (!session) return { error: "Authentication required.", status: 401 as const };
  const [profile, state] = await Promise.all([
    getProfile(session.learnerId),
    getLearnerState(session.learnerId),
  ]);
  return { session, profile, state };
}

type AICallOptions = {
  learnerId?: string;
  task?: AITask;
  complexity?: "LOW" | "MEDIUM" | "HIGH";
  retrievalQuery?: string;
};

type UsageLike = { total_tokens?: unknown; input_tokens?: unknown; output_tokens?: unknown };

const DEFAULT_DAILY_HARD_LIMIT_CENTS = 500;
const DEFAULT_COST_CENTS_PER_1K_TOKENS = 1;

function envInteger(name: string, fallback: number): number {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
}

function estimatedCentsForRoute(route: ModelRoute): number {
  const centsPer1k = envInteger("OPENAI_ESTIMATED_COST_CENTS_PER_1K_TOKENS", DEFAULT_COST_CENTS_PER_1K_TOKENS);
  return Math.max(1, Math.ceil((route.maxTokens / 1000) * centsPer1k));
}

async function reserveDailyBudget(learnerId: string, estimatedCents: number): Promise<{ allowed: boolean; usedCents: number; hardLimitCents: number }> {
  const hardLimitCents = envInteger("OPENAI_DAILY_HARD_LIMIT_CENTS", DEFAULT_DAILY_HARD_LIMIT_CENTS);
  const result = await query<{ estimated_cents: number }>(
    `INSERT INTO ai_usage_daily (learner_id, usage_date, estimated_cents, request_count)
     VALUES ($1, CURRENT_DATE, $2, 1)
     ON CONFLICT (learner_id, usage_date) DO UPDATE
       SET estimated_cents = ai_usage_daily.estimated_cents + EXCLUDED.estimated_cents,
           request_count = ai_usage_daily.request_count + 1
       WHERE ai_usage_daily.estimated_cents + EXCLUDED.estimated_cents <= $3
     RETURNING estimated_cents`,
    [learnerId, estimatedCents, hardLimitCents],
  );
  if (result.rowCount === 0) return { allowed: false, usedCents: hardLimitCents, hardLimitCents };
  return { allowed: true, usedCents: Number(result.rows[0].estimated_cents), hardLimitCents };
}

async function retrieveApprovedContext(search: string): Promise<string> {
  const normalized = search.trim();
  if (normalized.length < 2) return "";
  try {
    const result = await query<{
      document_id: string;
      source_id: string;
      title: string;
      body: string;
      version: string;
      level: string | null;
      objective_id: string | null;
      approved_for_rag: boolean;
      rights: string;
    }>(
      `SELECT d.id AS document_id, d.source_id, d.title, d.body, d.version, d.level, d.objective_id,
              d.approved_for_rag, s.rights
         FROM knowledge_documents d
         JOIN knowledge_sources s ON s.id = d.source_id
        WHERE d.approved_for_rag = TRUE
          AND s.approved_for_rag = TRUE
        ORDER BY d.created_at DESC
        LIMIT 100`,
      [],
    );
    const candidates = result.rows
      .filter((row) => row.approved_for_rag && ["OWNED", "LICENSED", "PUBLIC_DOMAIN", "ATTRIBUTED"].includes(row.rights as RagRights))
      .map((row) => ({ id: row.document_id, sourceId: row.source_id, title: row.title, excerpt: "", version: row.version, score: 0, body: row.body, level: row.level ?? undefined, objectiveId: row.objective_id ?? undefined }));
    return rankKnowledgeDocuments(normalized, candidates).map((hit) => `[${hit.title} | source:${hit.sourceId} | version:${hit.version}] ${hit.excerpt}`).join("\n");
  } catch {
    return "";
  }
}

export async function callAI(system: string, user: string, options: AICallOptions = {}) {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const apiKey = process.env.OPENAI_API_KEY;
  const task = options.task ?? "LESSON";
  const complexity = options.complexity ?? "MEDIUM";
  const route = routeAITask(task, complexity);
  const model = route.model;
  const jsonInstruction = "\n\nRespond with ONLY a single valid JSON object. No markdown code fences, no commentary before or after.";

  if (!apiKey) {
    return { error: "AI service is not configured. Set OPENAI_API_KEY on the server.", status: 503 as const, requestId };
  }

  let budget: { usedCents: number; hardLimitCents: number } | undefined;
  if (options.learnerId) {
    try {
      const reservation = await reserveDailyBudget(options.learnerId, estimatedCentsForRoute(route));
      if (!reservation.allowed) {
        return { error: "Daily AI usage limit reached. Your saved learning data is safe; try again tomorrow.", status: 429 as const, requestId };
      }
      budget = reservation;
    } catch {
      return { error: "AI usage controls are temporarily unavailable. Please retry.", status: 503 as const, requestId };
    }
  }

  let groundedUser = user;
  if (options.retrievalQuery) {
    const context = await retrieveApprovedContext(options.retrievalQuery);
    if (context) groundedUser = `${user}\n\nAPPROVED REFERENCE CONTEXT:\n${context}\n\nUse the reference context only when relevant. Do not imply a source was consulted if no context is provided.`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: [{ type: "input_text", text: system + jsonInstruction }] },
          { role: "user", content: [{ type: "input_text", text: groundedUser }] },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      if (options.learnerId) await recordAiEvent({ learnerId: options.learnerId, requestId, operation: task, provider: "openai", model, result: "PROVIDER_ERROR", latencyMs: Date.now() - startedAt, signalCount: budget ? 1 : undefined });
      return { error: `AI provider error (${response.status}).`, status: 502 as const, requestId };
    }
    const payload = await response.json() as { output_text?: string; usage?: UsageLike };
    const text = payload.output_text?.trim();
    const usageTokens = Number(payload.usage?.total_tokens ?? ((Number(payload.usage?.input_tokens) || 0) + (Number(payload.usage?.output_tokens) || 0)));
    const latencyMs = Date.now() - startedAt;
    if (!text) {
      if (options.learnerId) await recordAiEvent({ learnerId: options.learnerId, requestId, operation: task, provider: "openai", model, result: "INVALID_PAYLOAD", latencyMs, signalCount: usageTokens || undefined });
      return { error: "AI provider returned an empty response.", status: 502 as const, requestId };
    }
    const cleaned = text.replace(/^```json\s*|^```\s*|```\s*$/g, "").trim();
    try {
      const value = JSON.parse(cleaned) as Record<string, unknown>;
      if (options.learnerId) await recordAiEvent({ learnerId: options.learnerId, requestId, operation: task, provider: "openai", model, result: "SUCCESS", latencyMs, signalCount: usageTokens || undefined, score: budget?.usedCents });
      return { value, requestId, provider: "openai", model, latencyMs, usageTokens, budgetUsedCents: budget?.usedCents };
    } catch {
      if (options.learnerId) await recordAiEvent({ learnerId: options.learnerId, requestId, operation: task, provider: "openai", model, result: "INVALID_PAYLOAD", latencyMs, signalCount: usageTokens || undefined });
      return { error: "AI provider returned malformed JSON.", status: 502 as const, requestId };
    }
  } catch (error) {
    const latencyMs = Date.now() - startedAt;
    if (options.learnerId) await recordAiEvent({ learnerId: options.learnerId, requestId, operation: task, provider: "openai", model, result: "PROVIDER_ERROR", latencyMs, signalCount: budget ? 1 : undefined });
    if (error instanceof Error && error.name === "TimeoutError") return { error: "AI provider timed out. Please retry.", status: 504 as const, requestId };
    return { error: "Unable to reach the AI provider.", status: 502 as const, requestId };
  }
}

export async function recordAiEvent(input: {
  learnerId: string;
  requestId: string;
  operation: string;
  provider: string;
  model: string;
  result: "SUCCESS" | "INVALID_PAYLOAD" | "PROVIDER_ERROR";
  latencyMs: number;
  score?: number;
  errorCount?: number;
  signalCount?: number;
}) {
  await query(
    `INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at)
     VALUES ($1, $2, 'AI_FEEDBACK', $3::jsonb, NOW())`,
    [randomUUID(), input.learnerId, JSON.stringify({ requestId: input.requestId, operation: input.operation, provider: input.provider, model: input.model, result: input.result, latencyMs: input.latencyMs, score: input.score ?? null, errorCount: input.errorCount ?? null, signalCount: input.signalCount ?? null })],
  );
}

const LEARNING_LEVELS: Record<string, LearningLevel> = { PRE_A1: "PRE_A1", "PRE-A1": "PRE_A1", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1", C2: "C2" };
function toLearningLevel(value: string): LearningLevel { return LEARNING_LEVELS[value.toUpperCase()] ?? "B1"; }
function outcomeForScore(score: number): "CORRECT" | "PARTIAL" | "INCORRECT" { if (score >= 80) return "CORRECT"; if (score >= 60) return "PARTIAL"; return "INCORRECT"; }

export async function recordLearnerFeedbackEvidence(input: { learnerId: string; operation: string; modality: EvidenceModality; level: string; score: number; capabilityId: string; errorTags: string[]; requestId: string; }) {
  const evidence = buildEvidence({ id: randomUUID(), learnerId: input.learnerId, sessionType: "STANDARD_JOURNEY", missionId: `ai-${input.operation}`, objectiveId: `ai-feedback-${input.operation}`, capabilityIds: [input.capabilityId], modality: input.modality, outcome: outcomeForScore(input.score), score: input.score, confidence: 0.7, level: toLearningLevel(input.level), context: "FAMILIAR", errorTags: input.errorTags, createdAt: new Date().toISOString() });
  await query(`INSERT INTO learning_events (id, learner_id, event_type, payload, occurred_at) VALUES ($1, $2, 'LEARNING_EVIDENCE', $3::jsonb, $4)`, [evidence.id, input.learnerId, JSON.stringify({ ...evidence, source: "AI_FEEDBACK", requestId: input.requestId }), evidence.createdAt]);
  return evidence;
}

function isString(value: unknown): value is string { return typeof value === "string"; }
function isStringArray(value: unknown): value is string[] { return Array.isArray(value) && value.every(isString); }
function isNumber(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }
export function validateLessonResponse(value: Record<string, unknown>) { const guidedPractice = value.guidedPractice; if (!isString(value.title) || !isString(value.objective) || !isString(value.explanation) || !isStringArray(value.examples) || !Array.isArray(guidedPractice) || !guidedPractice.every((item) => item && typeof item === "object" && isString((item as Record<string, unknown>).prompt) && isString((item as Record<string, unknown>).answer)) || !isString(value.productionTask) || !isStringArray(value.successCriteria) || !isString(value.reviewTip)) return null; return value; }
export function validateWritingResponse(value: Record<string, unknown>) { const errors = value.errors; if (!isNumber(value.score) || value.score < 0 || value.score > 100 || !isString(value.correctedAnswer) || !isStringArray(value.strengths) || !Array.isArray(errors) || !errors.every((item) => item && typeof item === "object" && isString((item as Record<string, unknown>).text) && isString((item as Record<string, unknown>).explanation) && isString((item as Record<string, unknown>).correction) && isString((item as Record<string, unknown>).type)) || !isString(value.nextPractice)) return null; return value; }
export function validateSpeakingResponse(value: Record<string, unknown>) { const corrections = value.corrections; if (!isNumber(value.score) || value.score < 0 || value.score > 100 || !isStringArray(value.strengths) || !Array.isArray(corrections) || !corrections.every((item) => item && typeof item === "object" && isString((item as Record<string, unknown>).original) && isString((item as Record<string, unknown>).improved) && isString((item as Record<string, unknown>).explanation)) || !isStringArray(value.pronunciationRisks) || !isString(value.nextPractice) || !isString(value.disclaimer)) return null; return value; }
