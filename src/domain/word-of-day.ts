import type { CEFRLevel } from "./curriculum";

export interface WordOfDay { word: string; level: CEFRLevel; partOfSpeech: string; meaning: string; arabicMeaning: string; pronunciation: string; example: string; }

export const WORDS_OF_DAY: WordOfDay[] = [
  { word: "hello", level: "Pre-A1", partOfSpeech: "interjection", meaning: "a greeting", arabicMeaning: "مرحبًا", pronunciation: "/heh-LOH/ · هِلو", example: "Hello, my name is Omar." },
  { word: "appointment", level: "A1", partOfSpeech: "noun", meaning: "an arranged time to meet someone", arabicMeaning: "موعد", pronunciation: "/uh-POINT-ment/ · أَبُوينتمنت", example: "I have a doctor's appointment." },
  { word: "explore", level: "A2", partOfSpeech: "verb", meaning: "to travel around or examine a place or idea", arabicMeaning: "يستكشف", pronunciation: "/ik-SPLORE/ · إكسبلور", example: "We want to explore the city." },
  { word: "transition", level: "B1", partOfSpeech: "noun", meaning: "the process of changing from one state to another", arabicMeaning: "انتقال / مرحلة انتقالية", pronunciation: "/tran-ZISH-un/ · ترانزِشِن", example: "The transition to a new role took time." },
  { word: "deliberate", level: "B2", partOfSpeech: "adjective", meaning: "done carefully and intentionally", arabicMeaning: "متعمد ومدروس", pronunciation: "/di-LIB-er-it/ · دِلِبِرِت", example: "Her communication was deliberate and clear." },
  { word: "proportionality", level: "C1", partOfSpeech: "noun", meaning: "the quality of being appropriately balanced in size or effect", arabicMeaning: "التناسب", pronunciation: "/proh-por-shuh-NAL-uh-tee/ · بروبورشنالِتي", example: "The court considered proportionality." },
  { word: "intrusive", level: "C2", partOfSpeech: "adjective", meaning: "affecting someone's private life in an unwanted way", arabicMeaning: "تدخلي / متطفل", pronunciation: "/in-TROO-siv/ · إنتروسِف", example: "The policy was criticized as intrusive." },
];

export function wordOfDayForLevel(level: CEFRLevel): WordOfDay {
  return WORDS_OF_DAY.find((item) => item.level === level) ?? WORDS_OF_DAY[1];
}
