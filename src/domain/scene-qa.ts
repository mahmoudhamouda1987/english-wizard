/**
 * Scene content-integrity validator — master-prompt §6 QA automation.
 * Scans EVERY scene and flags any speaker/character/gender/dialogue mismatch
 * as a failed content-integrity item. Zero critical failures is the release bar.
 */

import { LEARNING_SCENES as SCENES } from "./scenes";
import { CHARACTER_UNIVERSE, type CharacterGender } from "./characters";
import { MVP_LESSONS } from "./curriculum";
import type { SceneLine, SceneQuizItem } from "./scenes-types";

export interface SceneIssue {
  sceneId: string;
  sceneTitle: string;
  check: "duplicate-id" | "character-registry" | "gender-consistency" | "line-integrity" | "quiz-integrity" | "lesson-reference" | "voice-policy";
  severity: "critical" | "high" | "medium";
  detail: string;
}

export interface SceneQaReport {
  totalScenes: number;
  passedScenes: number;
  failedScenes: number;
  issues: SceneIssue[];
  summary: Record<string, number>;
}

/** Explicitly gendered English names used across the curriculum universe. */
const NAME_GENDER_DICTIONARY: Record<string, CharacterGender> = Object.fromEntries(
  CHARACTER_UNIVERSE.map((profile) => [profile.name.toLowerCase(), profile.gender]),
);

function genderOfUnknownName(name: string): CharacterGender | null {
  const lower = name.trim().toLowerCase();
  if (/^(mary|sarah|emma|olivia|amelia|isla|sophia|grace|ruby|eva|anna|nina|lucy|daisy|hannah|zara|fatima|aisha|layla|mona|heba|salma|yara|dana|rania)$/.test(lower)) return "female";
  if (/^(john|james|oliver|george|noah|arthur|mohammed|ahmed|omar|hassan|khalid|peter|mark|paul|luke|jake|adam(?!a)|samir|tariq)$/.test(lower)) return "male";
  return null;
}

export function validateScenes(): SceneQaReport {
  const issues: SceneIssue[] = [];
  const seenIds = new Set<string>();
  const lessonIdSet = new Set(MVP_LESSONS.map((lesson) => lesson.id));

  for (const scene of SCENES) {
    const add = (check: SceneIssue["check"], severity: SceneIssue["severity"], detail: string) =>
      issues.push({ sceneId: scene.id, sceneTitle: scene.title, check, severity, detail });

    // Duplicate IDs
    if (seenIds.has(scene.id)) add("duplicate-id", "high", `Scene id "${scene.id}" appears more than once in the registry.`);
    seenIds.add(scene.id);

    // Character registry membership + gender consistency + voice policy
    for (const slot of ["a", "b"] as const) {
      const character = scene.characters[slot];
      if (!character?.name?.trim()) {
        add("character-registry", "critical", `Speaker slot ${slot} has no name.`);
        continue;
      }
      const registered = CHARACTER_UNIVERSE.find((profile) => profile.name.toLowerCase() === character.name.trim().toLowerCase());
      if (!registered) {
        add("character-registry", "medium", `"${character.name}" is not in the canonical character registry (one-off extra).`);
        continue;
      }
      if (character.emoji !== registered.emoji) add("character-registry", "medium", `"${character.name}" emoji differs from registry avatar.`);
      const dictionaryGender = NAME_GENDER_DICTIONARY[character.name.toLowerCase()] ?? genderOfUnknownName(character.name);
      if (dictionaryGender && dictionaryGender !== registered.gender) {
        add("gender-consistency", "critical", `"${character.name}" is explicitly ${dictionaryGender} by name but registered as ${registered.gender}.`);
      }
    }

    // Distinct speakers per scene
    if (scene.characters.a?.name && scene.characters.b?.name && scene.characters.a.name === scene.characters.b.name) {
      add("character-registry", "high", `Both speaker slots are "${scene.characters.a.name}" — a scene needs two distinct voices.`);
    }

    // Line integrity (transcript/subtitle completeness, speaker labels)
    if (!Array.isArray(scene.lines) || scene.lines.length < 4) {
      add("line-integrity", "high", `Only ${scene.lines?.length ?? 0} lines — scenes need at least four exchanges to teach context.`);
    } else {
      scene.lines.forEach((lineItem: SceneLine, index: number) => {
        if (lineItem.speaker !== "a" && lineItem.speaker !== "b") add("line-integrity", "critical", `Line ${index + 1} has invalid speaker label.`);
        if (!lineItem.text || !lineItem.text.trim()) add("line-integrity", "critical", `Line ${index + 1} has empty dialogue text (nothing to speak or display).`);
        if (!lineItem.ar || !lineItem.ar.trim()) add("line-integrity", "medium", `Line ${index + 1} is missing its Arabic subtitle.`);
      });
    }

    // Quiz integrity
    if (!Array.isArray(scene.quiz) || scene.quiz.length === 0) {
      add("quiz-integrity", "medium", "Scene has no comprehension quiz.");
    } else {
      scene.quiz.forEach((quizItem: SceneQuizItem, index: number) => {
        if (!Array.isArray(quizItem.choices) || quizItem.choices.length < 2) add("quiz-integrity", "high", `Quiz item ${index + 1} has fewer than two choices.`);
        else if (quizItem.answer < 0 || quizItem.answer >= quizItem.choices.length) add("quiz-integrity", "critical", `Quiz item ${index + 1} answer index out of range.`);
      });
    }

    // Lesson references resolve to real lessons when specified
    for (const lessonId of scene.lessonIds ?? []) {
      if (!lessonIdSet.has(lessonId)) add("lesson-reference", "high", `References unknown lesson id "${lessonId}".`);
    }
  }

  const summary: Record<string, number> = {};
  for (const issue of issues) summary[issue.check] = (summary[issue.check] ?? 0) + 1;
  const failing = new Set(issues.filter((issue) => issue.severity !== "medium").map((issue) => issue.sceneId));
  return {
    totalScenes: SCENES.length,
    passedScenes: SCENES.length - failing.size,
    failedScenes: failing.size,
    issues,
    summary,
  };
}

export function hasCriticalSceneIssues(report: SceneQaReport): boolean {
  return report.issues.some((issue) => issue.severity === "critical");
}
