/** Shared types for in-platform animated learning scenes. */
import type { CEFRLevel } from "./learner";

export interface SceneLine {
  speaker: "a" | "b";
  text: string;
  ar: string;
  /** Teaching point highlighted in the transcript. */
  note?: string;
}

export interface SceneQuizItem { q: string; choices: string[]; answer: number }

export interface LearningScene {
  id: string;
  title: string;
  levels: CEFRLevel[];
  topics: string[];
  setting: string;
  prop: string;
  palette: [string, string];
  characters: { a: { name: string; emoji: string }; b: { name: string; emoji: string } };
  lines: SceneLine[];
  quiz: SceneQuizItem[];
}
