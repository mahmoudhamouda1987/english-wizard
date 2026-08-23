import type { Skill, SkillMastery, LearnerState, CEFRLevel } from "./learner";
import { ALL_LESSONS } from "./all-lessons";

export interface DiagnosticAnswer { id: string; answer: string; }
export interface DiagnosticProduction { writingSample?: string; speakingTranscript?: string; }

const QUESTION_BANK: Array<{ id: string; skill: Skill; correct: string; objectiveId: string }> = [
  { id: "q1", skill: "grammar", correct: "am", objectiveId: "obj-01" },
  { id: "q2", skill: "vocabulary", correct: "appointment", objectiveId: "obj-05" },
  { id: "q3", skill: "reading", correct: "meet him", objectiveId: "obj-01" },
  { id: "q4", skill: "listening", correct: "station", objectiveId: "obj-04" },
  { id: "q5", skill: "speaking", correct: "my name is", objectiveId: "obj-01" },
  { id: "q6", skill: "writing", correct: "work", objectiveId: "obj-10" },
  { id: "q7", skill: "grammar", correct: "went", objectiveId: "obj-07" },
  { id: "q8", skill: "vocabulary", correct: "schedule", objectiveId: "obj-11" },
  { id: "q9", skill: "reading", correct: "because", objectiveId: "obj-13" },
  { id: "q10", skill: "listening", correct: "tomorrow", objectiveId: "obj-08" },
  { id: "q11", skill: "grammar", correct: "have been", objectiveId: "obj-07" },
  { id: "q12", skill: "vocabulary", correct: "although", objectiveId: "obj-26" },
];

export const diagnosticQuestions = [
  { id: "q1", skill: "grammar", prompt: "I ___ from Cairo.", options: ["am", "is", "are"] },
  { id: "q2", skill: "vocabulary", prompt: "I have a doctor's ___ at 4 PM.", options: ["appointment", "weather", "station"] },
  { id: "q3", skill: "reading", prompt: "Sara wants to meet Tom. What will she do?", options: ["meet him", "call the station", "cook dinner"] },
  { id: "q4", skill: "listening", prompt: "Listen to the sentence, then choose the key information.", options: ["station", "food", "weather"], audioText: "The train leaves from the station at six o'clock." },
  { id: "q5", skill: "speaking", prompt: "Choose the best opening when meeting someone.", options: ["My name is...", "Close the window.", "Yesterday was rainy."] },
  { id: "q6", skill: "writing", prompt: "Complete: I ___ in an office.", options: ["work", "works", "working"] },
  { id: "q7", skill: "grammar", prompt: "Yesterday I ___ to the museum.", options: ["go", "went", "going"] },
  { id: "q8", skill: "vocabulary", prompt: "Which word fits a work-planning conversation?", options: ["schedule", "banana", "pillow"] },
  { id: "q9", skill: "reading", prompt: "I stayed home because it rained. Why did I stay home?", options: ["because it rained", "because I travelled", "because I was shopping"] },
  { id: "q10", skill: "listening", prompt: "Listen: 'I can meet you tomorrow after lunch.' When can the person meet?", options: ["tomorrow", "yesterday", "next month"], audioText: "I can meet you tomorrow after lunch." },
  { id: "q11", skill: "grammar", prompt: "I ___ here for three years.", options: ["have been", "was", "am been"] },
  { id: "q12", skill: "vocabulary", prompt: "Which connector shows contrast?", options: ["although", "because", "therefore"] },
];

function levelFor(score: number): CEFRLevel { if (score >= 90) return "C1"; if (score >= 78) return "B2"; if (score >= 62) return "B1"; if (score >= 45) return "A2"; if (score >= 25) return "A1"; return "Pre-A1"; }
function productionScore(text: string | undefined, minimumWords: number): number { const normalized = text?.trim() ?? ""; if (!normalized) return 0; const words = normalized.split(/\s+/).filter(Boolean).length; const sentences = normalized.split(/[.!?]+/).filter(Boolean).length; return Math.min(100, Math.round((Math.min(words / minimumWords, 1) * 70) + (Math.min(sentences / 3, 1) * 30))); }

export function scoreDiagnostic(answers: DiagnosticAnswer[], now = new Date().toISOString(), production: DiagnosticProduction = {}) {
  const bySkill = new Map<Skill, { correct: number; total: number }>();
  for (const q of QUESTION_BANK) bySkill.set(q.skill, { correct: 0, total: 0 });
  for (const q of QUESTION_BANK) { const answer = answers.find((item) => item.id === q.id)?.answer?.trim().toLowerCase(); const item = bySkill.get(q.skill)!; item.total += 1; if (answer === q.correct) item.correct += 1; }
  const baseSkillScores = [...bySkill.entries()].map(([skill, value]) => ({ skill, score: Math.round((value.correct / Math.max(1, value.total)) * 100) }));
  const writing = productionScore(production.writingSample, 45); const speaking = productionScore(production.speakingTranscript, 25);
  const skillScores = baseSkillScores.map((item) => item.skill === "writing" ? { ...item, score: Math.round((item.score + writing) / 2) } : item.skill === "speaking" ? { ...item, score: Math.round((item.score + speaking) / 2) } : item);
  const overallScore = Math.round(skillScores.reduce((sum, item) => sum + item.score, 0) / skillScores.length); const level = levelFor(overallScore);
  const mastery: SkillMastery[] = skillScores.map((item) => ({ skill: item.skill, level, score: item.score, confidence: Math.min(1, 0.5 + item.score / 200), updatedAt: now }));
  const sorted = [...skillScores].sort((a, b) => b.score - a.score);
  return { overallScore, level, skillScores, mastery, strengths: sorted.slice(0, 2).map((item) => item.skill), focusAreas: sorted.slice(-2).map((item) => item.skill), production: { writingScore: writing, speakingScore: speaking } };
}

export function applyDiagnosticToState(state: LearnerState, mastery: SkillMastery[], now: string, level?: CEFRLevel): LearnerState {
  const map = new Map(state.mastery.map((item) => [item.skill, item])); for (const item of mastery) map.set(item.skill, item);
  const rankedLessons = [...ALL_LESSONS].sort((a, b) => a.sequence - b.sequence); const preferredLevel = level ?? mastery[0]?.level ?? "A1";
  const levelRank: Record<CEFRLevel, number> = { "Pre-A1": 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 }; const targetRank = levelRank[preferredLevel];
  const candidate = rankedLessons.find((lesson) => { const lessonRank = lesson.level === "Pre-A1" ? 0 : levelRank[lesson.level as CEFRLevel]; return lessonRank >= targetRank; }) ?? rankedLessons[0] ?? null;
  const candidateIndex = candidate ? rankedLessons.indexOf(candidate) : -1;
  const lessonHistory = state.lessonHistory.length === 0 ? rankedLessons.map((lesson, index) => ({ lessonId: lesson.id, objectiveId: lesson.objectiveId, status: index === candidateIndex ? "in_progress" as const : "not_started" as const, ...(index === candidateIndex ? { startedAt: now } : {}), attemptCount: 0, evidenceIds: [] })) : state.lessonHistory.map((record) => record.lessonId === candidate?.id && record.status === "not_started" ? { ...record, status: "in_progress" as const, startedAt: now } : record);
  return { ...state, currentLessonId: candidate?.id ?? state.currentLessonId, lessonHistory, mastery: [...map.values()], nextAction: candidate ? { type: "lesson", id: candidate.id, reason: "Continue the curriculum lesson selected from your diagnostic result.", priority: "MEDIUM" } : state.nextAction, version: state.version + 1, updatedAt: now };
}
