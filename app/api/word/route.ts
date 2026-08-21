import { NextRequest, NextResponse } from "next/server";
import { WORDS_OF_DAY } from "@/src/domain/word-of-day";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("word")?.trim() ?? "";
  const word = raw.replace(/[^A-Za-z'-]/g, "").toLowerCase();
  if (!word || word.length > 60) return NextResponse.json({ error: "A valid word is required." }, { status: 400 });

  const curated = WORDS_OF_DAY.find((item) => item.word.toLowerCase() === word);
  if (curated) return NextResponse.json({ word, meaning: curated.meaning, arabicMeaning: curated.arabicMeaning, pronunciation: curated.pronunciation, partOfSpeech: curated.partOfSpeech, source: "English Wizard curated vocabulary" });

  let meaning = "Definition not available yet.";
  let pronunciation = "Pronunciation not available yet.";
  let partOfSpeech = "word";

  try {
    const dictionary = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { cache: "force-cache" });
    if (dictionary.ok) {
      const entries = await dictionary.json() as Array<{ phonetic?: string; phonetics?: Array<{ text?: string }>; meanings?: Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string }> }> }>;
      const entry = entries[0];
      pronunciation = entry?.phonetic ?? entry?.phonetics?.find((item) => item.text)?.text ?? pronunciation;
      const firstMeaning = entry?.meanings?.find((item) => item.definitions?.[0]?.definition);
      meaning = firstMeaning?.definitions?.[0]?.definition ?? meaning;
      partOfSpeech = firstMeaning?.partOfSpeech ?? partOfSpeech;
    }
  } catch { /* fallback below keeps the learner experience usable */ }

  let arabicMeaning = "لم يتم العثور على ترجمة عربية بعد.";
  try {
    const translation = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en%7Car`, { cache: "no-store" });
    if (translation.ok) {
      const payload = await translation.json() as { responseData?: { translatedText?: string } };
      arabicMeaning = payload.responseData?.translatedText?.trim() || arabicMeaning;
    }
  } catch { /* keep fallback */ }

  return NextResponse.json({ word, meaning, arabicMeaning, pronunciation, partOfSpeech, source: "Dictionary API + MyMemory" });
}
