import { NextRequest, NextResponse } from "next/server";
import { WORDS_OF_DAY } from "@/src/domain/word-of-day";
import { GLOSSARY_AR_1, type GlossEntry } from "@/src/domain/glossary-ar-1";
import { GLOSSARY_AR_2 } from "@/src/domain/glossary-ar-2";

export const dynamic = "force-dynamic";

const CURATED: Record<string, GlossEntry> = { ...GLOSSARY_AR_1, ...GLOSSARY_AR_2 };

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("word")?.trim() ?? "";
  const word = raw.replace(/[^A-Za-z'-]/g, "").toLowerCase();
  if (!word || word.length > 60) return NextResponse.json({ error: "A valid word is required." }, { status: 400 });

  // 1. Human-curated platform vocabulary (highest trust).
  const curatedWordOfDay = WORDS_OF_DAY.find((item) => item.word.toLowerCase() === word);
  if (curatedWordOfDay) {
    return NextResponse.json({
      word,
      meaning: curatedWordOfDay.meaning,
      arabicMeaning: curatedWordOfDay.arabicMeaning,
      arabicAvailable: true,
      pronunciation: curatedWordOfDay.pronunciation,
      partOfSpeech: curatedWordOfDay.partOfSpeech,
      source: "English Wizard curated vocabulary",
      machineTranslated: false,
    });
  }

  let meaning = "";
  let pronunciation = "";
  let partOfSpeech = "";
  let source = "";

  // 2. Wiktionary REST definitions — Wikimedia (registered UK charity), the reference source for learner dictionaries.
  try {
    const wiktionary = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(word)}`, { cache: "force-cache", headers: { "Api-User-Agent": "EnglishWizard/2.0 (learning platform)" } });
    if (wiktionary.ok) {
      const payload = (await wiktionary.json()) as Record<string, Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string }> }>>;
      const english = payload["en"]?.[0];
      const first = english?.definitions?.find((d) => stripHtml(d.definition ?? "").length > 8);
      const text = stripHtml(first?.definition ?? "");
      if (text) {
        meaning = text.length > 240 ? `${text.slice(0, 237)}…` : text;
        partOfSpeech = (english?.partOfSpeech ?? "").toLowerCase();
        source = "Wiktionary";
      }
    }
  } catch { /* fall through */ }

  // 3. Dictionary API (Wiktionary-derived) as backup for meaning + IPA.
  if (!meaning || !pronunciation) {
    try {
      const dictionary = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { cache: "force-cache" });
      if (dictionary.ok) {
        const entries = (await dictionary.json()) as Array<{ phonetic?: string; phonetics?: Array<{ text?: string }>; meanings?: Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string }> }> }>;
        const entry = entries[0];
        if (!meaning && entry?.meanings?.length) {
          const first = entry.meanings.find((m) => m.definitions?.[0]?.definition);
          meaning = first?.definitions![0].definition!.slice(0, 240) ?? meaning;
          partOfSpeech = partOfSpeech || (first?.partOfSpeech ?? "");
          source = source || "Dictionary API";
        }
        pronunciation = entry?.phonetic ?? entry?.phonetics?.find((item) => item.text)?.text ?? pronunciation;
      }
    } catch { /* keep whatever we have */ }
  }

  // 4. Arabic: curated human glossary only — no machine guesses presented as fact.
  const gloss = CURATED[word] ?? null;

  return NextResponse.json({
    word,
    meaning: meaning || "Definition not available yet.",
    arabicMeaning: gloss?.ar ?? "",
    arabicAvailable: Boolean(gloss),
    pronunciation: pronunciation || "-",
    partOfSpeech: partOfSpeech || gloss?.pos || "word",
    source: source || (gloss ? "English Wizard glossary" : ""),
    machineTranslated: false,
  });
}
