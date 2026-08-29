"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PageHero } from "@/app/components/page-hero";

interface Hit { kind: string; title: string; meta: string; href: string }
interface Results { query: string; total: number; lessons: Hit[]; words: Hit[]; chunks: Hit[]; scenarios: Hit[]; scenes: Hit[] }

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

  function group(title: string, hits: Hit[]) {
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
      <PageHero icon="🔎" title="Search everything" sub="Lessons, words with Arabic, animated scenes, chunks and role-plays — all generated inside the platform, nothing links out." />
      <form
        onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(input.trim())}`); }}
        style={{ display: "flex", gap: 8, marginTop: 16 }}
      >
        <input aria-label="Search the platform" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Try “routine”, “موعد”, “complaint”…" style={{ flex: 1 }} />
        <button className="button">Search</button>
      </form>

      {!q && <div className="state-card" style={{ marginTop: 16 }}>Type something above — or try the dashboard search box (Ctrl K).</div>}
      {q && data && data.total === 0 && (
        <div className="state-card warning" style={{ marginTop: 16 }}>No matches inside the platform for “{q}” yet. Everything you find here is generated in-platform — try a shorter word.</div>
      )}
      {data && (
        <>
          {group(`Lessons (${data.lessons.length})`, data.lessons)}
          {group("Words with Arabic", data.words)}
          {group("Scenes", data.scenes)}
          {group("Chunks", data.chunks)}
          {group("Role-plays", data.scenarios)}
        </>
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