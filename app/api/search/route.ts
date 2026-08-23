import { NextResponse } from "next/server";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { LESSON_MATERIALS } from "@/src/domain/lesson-materials";
import { GLOSSARY_AR_1 } from "@/src/domain/glossary-ar-1";
import { GLOSSARY_AR_2 } from "@/src/domain/glossary-ar-2";
import { LEARNING_CHUNKS } from "@/src/domain/chunks";
import { ROLEPLAY_SCENARIOS } from "@/src/domain/roleplay";

export const dynamic = "force-dynamic";

const GLOSSARY: Record<string, { ar: string; en?: string }> = { ...GLOSSARY_AR_1, ...GLOSSARY_AR_2 };

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q || q.length > 60) return NextResponse.json({ error: "A search term is required." }, { status: 400 });

  const lessons = ALL_LESSONS
    .filter((l) => `${l.title} ${l.mission} ${l.skill} ${l.level}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map((l) => ({ kind: "Lesson", title: l.title, meta: `${l.level} · ${l.skill}`, href: `/learn?lesson=${encodeURIComponent(l.id)}` }));

  const words = Object.entries(GLOSSARY)
    .filter(([word]) => word.includes(q))
    .slice(0, 8)
    .map(([word, g]) => ({ kind: "Word", title: word, meta: `AR: ${g.ar}${g.en ? ` · ${g.en}` : ""}`, href: `/vocabulary` }));

  const chunks = LEARNING_CHUNKS.filter((c) => `${c.text} ${c.meaning}`.toLowerCase().includes(q))
    .slice(0, 5)
    .map((c) => ({ kind: "Chunk", title: c.text, meta: c.meaning, href: "/chunks" }));

  const scenarios = ROLEPLAY_SCENARIOS.filter((s) => `${s.title} ${s.situation}`.toLowerCase().includes(q))
    .slice(0, 4)
    .map((s) => ({ kind: "Role-play", title: s.title, meta: s.situation, href: `/roleplay` }));

  const external = [
    { kind: "British Council", title: `Search “${q}” on LearnEnglish`, meta: "UK CEFR-graded materials", href: `https://learnenglish.britishcouncil.org/search?query=${encodeURIComponent(q)}` },
    { kind: "BBC", title: `“${q}” on BBC Learning English`, meta: "Real-world audio & video", href: `https://www.bbc.co.uk/learningenglish/english/search?q=${encodeURIComponent(q)}` },
    { kind: "Cambridge", title: `Free activities for “${q}”`, meta: "Cambridge English practice", href: `https://www.cambridgeenglish.org/learning-english/games-social/` },
  ];

  const total = lessons.length + words.length + chunks.length + scenarios.length;
  return NextResponse.json({ query: q, total, lessons, words, chunks, scenarios, external });
}
