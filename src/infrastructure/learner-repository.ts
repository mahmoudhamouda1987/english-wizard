import type { LearnerState } from "@/src/domain/learner";
import type { NextActionType, NextActionRecommendation } from "@/src/domain/next-action";
import { buildMasteryGraph } from "@/src/domain/mastery-graph";
import { getDatabase, query } from "./database";

type LearnerStateRow = {
  learner_id: string;
  current_lesson_id: string | null;
  completed_lesson_ids: string[];
  lesson_history: LearnerState["lessonHistory"];
  mastery: LearnerState["mastery"];
  mastery_graph: NonNullable<LearnerState["masteryGraph"]>;
  errors: LearnerState["errors"];
  next_action: unknown;
  state_version: number;
  updated_at: Date | string;
};

const NEXT_ACTION_TYPES = new Set<NextActionType>([
  "lesson",
  "review",
  "assessment",
  "rest",
  "listening",
  "vocabulary",
  "pronunciation",
  "writing",
  "practice",
]);

function normalizeNextAction(value: unknown): NextActionRecommendation | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const type = typeof record.type === "string" && NEXT_ACTION_TYPES.has(record.type as NextActionType)
    ? record.type as NextActionType
    : null;
  const id = typeof record.id === "string" && record.id.trim() ? record.id : null;
  if (!type || !id) return null;

  const priority = record.priority === "HIGH" || record.priority === "MEDIUM" || record.priority === "LOW"
    ? record.priority
    : "LOW";
  const reason = typeof record.reason === "string" && record.reason.trim()
    ? record.reason
    : `Continue the recommended ${type} activity.`;

  return { type, id, reason, priority };
}

function asState(row: LearnerStateRow): LearnerState {
  const persistedGraph = Array.isArray(row.mastery_graph) ? row.mastery_graph : [];
  return {
    learnerId: row.learner_id,
    currentLessonId: row.current_lesson_id,
    completedLessonIds: row.completed_lesson_ids ?? [],
    lessonHistory: row.lesson_history ?? [],
    mastery: row.mastery ?? [],
    masteryGraph: persistedGraph.length ? persistedGraph : buildMasteryGraph(new Date(row.updated_at).toISOString()).mastery,
    errors: row.errors ?? [],
    nextAction: normalizeNextAction(row.next_action),
    version: row.state_version,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getLearnerState(learnerId: string): Promise<LearnerState | null> {
  const result = await query<LearnerStateRow>(
    `
      SELECT learner_id, current_lesson_id, completed_lesson_ids, lesson_history,
             mastery, mastery_graph, errors, next_action, state_version, updated_at
      FROM learner_state
      WHERE learner_id = $1
    `,
    [learnerId],
  );

  if (result.rowCount === 0) return null;
  return asState(result.rows[0]);
}

export async function saveLearnerState(state: LearnerState): Promise<LearnerState> {
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        INSERT INTO learners (id, version, updated_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE
        SET version = EXCLUDED.version, updated_at = EXCLUDED.updated_at
      `,
      [state.learnerId, state.version, state.updatedAt],
    );

    const persistedMasteryGraph = state.masteryGraph ?? buildMasteryGraph(state.updatedAt).mastery;
    const saved = await client.query<LearnerStateRow>(
      `
        INSERT INTO learner_state (
          learner_id, current_lesson_id, completed_lesson_ids, lesson_history,
          mastery, mastery_graph, errors, next_action, state_version, updated_at
        ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb, $9, $10)
        ON CONFLICT (learner_id) DO UPDATE SET
          current_lesson_id = EXCLUDED.current_lesson_id,
          completed_lesson_ids = EXCLUDED.completed_lesson_ids,
          lesson_history = EXCLUDED.lesson_history,
          mastery = EXCLUDED.mastery,
          mastery_graph = EXCLUDED.mastery_graph,
          errors = EXCLUDED.errors,
          next_action = EXCLUDED.next_action,
          state_version = EXCLUDED.state_version,
          updated_at = EXCLUDED.updated_at
        RETURNING learner_id, current_lesson_id, completed_lesson_ids, lesson_history,
                  mastery, mastery_graph, errors, next_action, state_version, updated_at
      `,
      [
        state.learnerId,
        state.currentLessonId,
        JSON.stringify(state.completedLessonIds),
        JSON.stringify(state.lessonHistory),
        JSON.stringify(state.mastery),
        JSON.stringify(persistedMasteryGraph),
        JSON.stringify(state.errors),
        JSON.stringify(state.nextAction),
        state.version,
        state.updatedAt,
      ],
    );

    await client.query("COMMIT");
    return asState(saved.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
