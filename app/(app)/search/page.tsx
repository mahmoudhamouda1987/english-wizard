"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHeader } from "@/app/components/page-header";
import { NAV_FLAT } from "@/app/components/nav-config";
import { ALL_LESSONS } from "@/src/domain/all-lessons";
import { WORLDS_V2 } from "@/src/domain/worlds-curriculum";
import { buildIeltsPlan, BAND_TARGETS } from "@/src/domain/ielts";
import { QUALIFICATIONS } from "@/src/domain/cambridge";
import { PROFESSIONAL_CURRICULUM } from "@/src/domain/professional-curriculum";
import { FLUENCY_MODULES, type FluencyTrack } from "@/src/domain/fluency-track";

interface Hit { kind: string; title: string; meta: string; href: string }
interface Results { query: string; total: number; lessons: Hit[]; words: Hit[]; chunks: Hit[]; scenarios: Hit[]; scenes: Hit[] }

/* ------------------------------------------------------------------ */
/* Extended in-memory index (Part 136) — static data only, no new API. */
/* Assembled once at module load from the domain exports.              */
/* ------------------------------------------------------------------ */

interface SearchEntry { label: string; sublabel: string; href: string; group: string }

/** One-line descriptions for nav surfaces that ship without a desc field. */
const NAV_SUBLABELS: Record<string, string> = {
  Dashboard: "Your daily plan, streak and next mission",
  Conversation: "Free talk with your AI teacher",
  "Role-play": "Guided real-life scenarios",
  "Speaking Coach": "Pronunciation and fluency feedback",
  "Say It Better": "Rework your sentences, keep your meaning",
  "Voice Time Machine": "Compare your voice across months",
  "Reality Checkpoints": "Prove it works in real-life tasks",
  "Review & Mastery": "Spaced review and mastery checks",
  "Progress & Insights": "Reports, analytics and evidence",
  "Portfolio & Evidence": "Verified work you can share",
  "English Ear": "Hear the sounds English really uses",
  Scenes: "Animated dialogue scenes",
  "Reading Studio": "Graded reading with word support",
  Writing: "Guided writing with feedback",
  Vocabulary: "Words with Arabic glosses",
  Grammar: "Grammar-in-use practice",
  "Thinking in English": "Drop translation, think directly",
  "Chunks & Mediation": "Fixed phrases and mediation tasks",
  "Teacher AI": "Ask your AI teacher anything",
  Community: "Learner posts and corrections",
  "Invite Friends": "Referrals and rewards",
  Settings: "Plan, theme and preferences",
};

const IELTS_STAGE_LABELS: Record<string, string> = { teach: "Teach", guided: "Guided", timed: "Timed", "module-test": "Module test" };
const FLUENCY_TRACK_LABELS: Record<FluencyTrack, string> = { BUSINESS: "Business Fluency", LIFE: "Life Fluency", DUAL: "Dual Track" };

function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];

  // Lessons — the general curriculum.
  for (const lesson of ALL_LESSONS) {
    entries.push({
      label: lesson.title,
      sublabel: `${lesson.level} · ${lesson.skill}`,
      href: `/learn?lesson=${encodeURIComponent(lesson.id)}`,
      group: "Lessons",
    });
  }

  // Worlds and their missions.
  for (const world of WORLDS_V2) {
    entries.push({
      label: world.title,
      sublabel: `World ${world.number} · ${world.level}`,
      href: "/worlds",
      group: "Worlds",
    });
    for (const mission of world.missions) {
      entries.push({
        label: mission.title,
        sublabel: `${world.title} · ${world.level}`,
        href: "/worlds",
        group: "Missions",
      });
    }
  }

  // IELTS — module names per skill/stage (titles are shared across variants and
  // bands), plus one entry per band target so band plans stay findable.
  const ieltsPlan = buildIeltsPlan("ACADEMIC", 6.5);
  for (const mod of ieltsPlan.modules) {
    const skill = mod.skill.charAt(0).toUpperCase() + mod.skill.slice(1);
    entries.push({
      label: mod.title,
      sublabel: `IELTS · ${skill} · ${IELTS_STAGE_LABELS[mod.stage] ?? mod.stage}`,
      href: "/ielts/course",
      group: "IELTS",
    });
  }
  for (const band of BAND_TARGETS) {
    entries.push({
      label: `IELTS Band ${band} plan`,
      sublabel: `IELTS · Target band ${band} · Academic & General Training`,
      href: "/ielts/course",
      group: "IELTS",
    });
  }

  // Cambridge qualifications.
  for (const qual of Object.values(QUALIFICATIONS)) {
    entries.push({
      label: qual.name,
      sublabel: `${qual.cefr} · ${qual.papers.length} papers`,
      href: "/cambridge/course",
      group: "Cambridge",
    });
  }

  // Business English modules.
  for (const lesson of PROFESSIONAL_CURRICULUM) {
    entries.push({
      label: lesson.title,
      sublabel: `${lesson.level} · ${lesson.category}`,
      href: "/business-english",
      group: "Business English",
    });
  }

  // Fluency Track modules.
  for (const mod of FLUENCY_MODULES) {
    entries.push({
      label: mod.title,
      sublabel: `${mod.band} · ${FLUENCY_TRACK_LABELS[mod.track]}`,
      href: "/fluency-track",
      group: "Fluency Track",
    });
  }

  // Navigation surfaces — products, tools, skill studios, reports, account.
  // NAV_FLAT keeps the existing nav lookup behaviour intact.
  for (const item of NAV_FLAT) {
    entries.push({
      label: item.label,
      sublabel: item.desc ?? NAV_SUBLABELS[item.label] ?? item.group,
      href: item.href,
      group: item.group,
    });
  }

  return entries;
}

const INDEX: SearchEntry[] = buildIndex();
const RESULTS_CAP = 20;

/** Case-insensitive match on label or sublabel, grouped by group, capped at 20. */
function searchIndex(raw: string): Array<{ group: string; items: SearchEntry[] }> {
  const needle = raw.trim().toLowerCase();
  if (!needle) return [];
  const buckets = new Map<string, SearchEntry[]>();
  let total = 0;
  for (const entry of INDEX) {
    if (total >= RESULTS_CAP) break;
    if (entry.label.toLowerCase().includes(needle) || entry.sublabel.toLowerCase().includes(needle)) {
      const bucket = buckets.get(entry.group);
      if (bucket) bucket.push(entry);
      else buckets.set(entry.group, [entry]);
      total += 1;
    }
  }
  return Array.from(buckets.entries()).map(([group, items]) => ({ group, items }));
}

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = params.get("q") ?? "";
  const [data, setData] = useState<Results | null>(null);
  const [input, setInput] = useState(q);

  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`, { cache: "no-store" }).then(r => r.json()).then(setData).catch(() => undefined);
  }, [q]);

  const quickMatches = useMemo(() => searchIndex(input), [input]);

  function contentGroup(title: string, hits: Hit[]) {
    if (!hits?.length) return null;
    return (
      <section style={{ marginTop: 18 }}>
        <p className="eyebrow">{title}</p>
        <div style={{ display: "grid", gap: 8 }}>
          {hits.map((h, i) => (
            <a key={`${h.kind}-${i}`} href={h.href} target={h.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="panel" style={{ margin: 0, padding: 14, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
              <span><strong>{h.title}</strong> <span className="chip">{h.kind}</span></span>
              <small className="subtle">{h.meta}</small>
            </a>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      <PageHeader
        eyebrow="Find the right activity"
        title="Search"
        purpose="Lessons, worlds, missions, exam modules, products, tools and every surface on the platform — one query, everything generated inside the platform."
      />
      <form
        onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(input.trim())}`); }}
        style={{ display: "flex", gap: 8, marginTop: 16 }}
      >
        <input autoFocus aria-label="Search the platform" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try “routine”, “موعد”, “complaint”…" style={{ flex: 1 }} />
        <button className="button">Search</button>
      </form>

      {!input.trim() && !q && <div className="state-card" style={{ marginTop: 16 }}>Type something above — or try the dashboard search box (Ctrl K).</div>}

      {/* Quick matches — the extended in-memory index, grouped and capped. */}
      {input.trim() && (
        <section aria-label="Quick matches" style={{ marginTop: 18 }}>
          {quickMatches.length > 0 ? (
            <>
              {quickMatches.map(({ group, items }) => (
                <section key={group} style={{ marginTop: 18 }}>
                  <p className="eyebrow">{group} <span className="subtle" style={{ textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>({items.length})</span></p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {items.map((entry, i) => (
                      <a key={`${entry.group}-${entry.label}-${i}`} href={entry.href} className="panel" style={{ margin: 0, padding: 14, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                        <span><strong>{entry.label}</strong> <span className="chip">{entry.group}</span></span>
                        <small className="subtle">{entry.sublabel}</small>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
              <p className="subtle" style={{ marginTop: 14, fontSize: 13 }}>Showing up to {RESULTS_CAP} quick matches. Press Search to also look inside the content library.</p>
            </>
          ) : (
            <div className="state-card" style={{ marginTop: 4 }}>No quick matches for “{input.trim()}”. Press Search to look inside the content library — words, chunks, scenes and role-plays.</div>
          )}
        </section>
      )}

      {/* Content library — the existing /api/search behaviour, kept intact. */}
      {q && (
        <section aria-label="Content library" style={{ marginTop: 26 }}>
          <p className="eyebrow">From the content library</p>
          {!data && <p className="subtle" style={{ marginTop: 14 }}>Searching the content library…</p>}
          {data && data.total > 0 && (
            <>
              {contentGroup(`Lessons (${data.lessons.length})`, data.lessons)}
              {contentGroup("Words with Arabic", data.words)}
              {contentGroup("Scenes", data.scenes)}
              {contentGroup("Chunks", data.chunks)}
              {contentGroup("Role-plays", data.scenarios)}
            </>
          )}
          {data && data.total === 0 && quickMatches.length === 0 && (
            <div className="state-card warning" style={{ marginTop: 16 }}>No matches inside the platform for “{q}” yet. Everything you find here is generated in-platform — try a shorter word.</div>
          )}
        </section>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main id="main-content" style={{ padding: 48 }}><p className="subtle">Loading search…</p></main>}>
      <SearchInner />
    </Suspense>
  );
}
