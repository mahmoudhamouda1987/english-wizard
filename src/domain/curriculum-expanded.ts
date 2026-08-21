import type { CEFRLevel } from "./curriculum";
export const FULL_LEVELS: CEFRLevel[]=["Pre-A1","A1","A2","B1","B2","C1","C2"];
export const LEVEL_GOALS: Record<CEFRLevel,string[]>={"Pre-A1":["introductions","survival phrases","basic sounds"],A1:["daily routines","basic questions","simple present"],A2:["past events","plans","comparisons"],B1:["opinions","stories","workplace communication"],B2:["arguments","nuance","professional fluency"],C1:["precision","register","complex discussion"],C2:["near-native flexibility","subtle inference","rhetorical control"]};
export function levelIndex(level:CEFRLevel){return FULL_LEVELS.indexOf(level);}
