import type { LearnerProfile } from "@/src/domain/profile";
import type { PathwaySelectionRecord } from "@/src/domain/pathways";
import { query } from "./database";

interface ProfileRow {
  learner_id: string;
  display_name: string;
  native_language: string;
  target_level: LearnerProfile["targetLevel"];
  daily_minutes: number;
  goals: string[];
  english_dna: LearnerProfile["englishDna"];
  pathway_selection: PathwaySelectionRecord | null;
  avatar_url: string | null;
  avatar_kind: string | null;
  updated_at: Date | string;
}

function mapProfile(row: ProfileRow): LearnerProfile {
  return {
    learnerId: row.learner_id,
    displayName: row.display_name,
    nativeLanguage: row.native_language,
    targetLevel: row.target_level,
    dailyMinutes: row.daily_minutes,
    goals: row.goals ?? [],
    avatarUrl: row.avatar_url ?? null,
    avatarKind: row.avatar_kind === "photo" || row.avatar_kind === "avatar" ? row.avatar_kind : "initials",
    englishDna: row.english_dna ?? { overallLevel: row.target_level, strengths: [], focusAreas: [], preferredSkills: [], confidence: 0 },
    pathwaySelection: row.pathway_selection ?? null,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

export async function getProfile(learnerId: string): Promise<LearnerProfile | null> {
  const result = await query<ProfileRow>(
    `SELECT learner_id, display_name, native_language, target_level, daily_minutes, goals, english_dna, pathway_selection, avatar_url, avatar_kind, updated_at
     FROM learner_profiles WHERE learner_id = $1`,
    [learnerId],
  );
  return result.rowCount ? mapProfile(result.rows[0]) : null;
}

export async function upsertProfile(profile: LearnerProfile): Promise<LearnerProfile> {
  // Avatar fields are optional on the domain object: callers that do not touch
  // the profile picture (e.g. the diagnostic flow creating the first profile
  // row) must neither violate the NOT NULL default nor reset an existing avatar.
  const touchesAvatar = profile.avatarKind !== undefined || profile.avatarUrl !== undefined;
  const result = await query<ProfileRow>(
    `INSERT INTO learner_profiles
       (learner_id, display_name, native_language, target_level, daily_minutes, goals, english_dna, pathway_selection, avatar_url, avatar_kind, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9,COALESCE($10,'initials'),NOW())
     ON CONFLICT (learner_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       native_language = EXCLUDED.native_language,
       target_level = EXCLUDED.target_level,
       daily_minutes = EXCLUDED.daily_minutes,
       goals = EXCLUDED.goals,
       english_dna = EXCLUDED.english_dna,
       pathway_selection = EXCLUDED.pathway_selection,
       avatar_url = CASE
         WHEN $11 THEN CASE WHEN EXCLUDED.avatar_kind = 'initials' THEN NULL ELSE COALESCE(EXCLUDED.avatar_url, learner_profiles.avatar_url) END
         ELSE learner_profiles.avatar_url END,
       avatar_kind = CASE WHEN $11 THEN COALESCE(EXCLUDED.avatar_kind, learner_profiles.avatar_kind) ELSE learner_profiles.avatar_kind END,
       updated_at = NOW()
     RETURNING learner_id, display_name, native_language, target_level, daily_minutes, goals, english_dna, pathway_selection, avatar_url, avatar_kind, updated_at`,
    [profile.learnerId, profile.displayName, profile.nativeLanguage, profile.targetLevel, profile.dailyMinutes, JSON.stringify(profile.goals), JSON.stringify(profile.englishDna), profile.pathwaySelection ? JSON.stringify(profile.pathwaySelection) : null, profile.avatarUrl ?? null, profile.avatarKind ?? null, touchesAvatar],
  );
  return mapProfile(result.rows[0]);
}
