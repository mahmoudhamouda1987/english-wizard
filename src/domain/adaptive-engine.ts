import type { LearnerState } from "./learner-state";
export type LearningAction = { type: "lesson" | "listening" | "vocabulary" | "pronunciation" | "writing" | "review" | "practice"; id: string; reason: string };
export function nextBestAction(state: LearnerState): LearningAction {
 const severe=[...state.errors].sort((a,b)=>b.occurrences-a.occurrences)[0];
 if(severe) return {type:"review",id:severe.id,reason:`Review recurring issue: ${severe.description}`};
 const low=[...state.mastery].sort((a,b)=>a.score-b.score)[0];
 if(low && low.score<70) return {type:"practice",id:low.skill,reason:`Strengthen ${low.skill}`};
 const next=state.lessonHistory.find(x=>x.status!=="completed");
 if(next) return {type:"lesson",id:next.lessonId,reason:"Continue your learning path"};
 return {type:"listening",id:"daily-listening",reason:"Maintain listening exposure"};
}
