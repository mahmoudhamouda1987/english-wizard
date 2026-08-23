"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LEARNING_SCENES } from "@/src/domain/scenes";
import { ScenePlayer } from "@/app/components/scene-player";
import { PageHero } from "@/app/components/page-hero";

function ScenesInner() {
  const params = useSearchParams();
  const initial = params.get("scene");
  const [activeId, setActiveId] = useState<string | null>(initial && LEARNING_SCENES.some((s) => s.id === initial) ? initial : null);
  const active = LEARNING_SCENES.find((s) => s.id === activeId) ?? null;

  return (
    <main id="main-content" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <PageHero icon="🎬" title="Scene Studio" sub="Twelve animated real-life conversations — every voice, subtitle and visual generated inside the platform. Watch, listen, then prove you understood." />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
        {LEARNING_SCENES.map((s) => (
          <button key={s.id} type="button" className={activeId === s.id ? "button" : "button secondary"} aria-pressed={activeId === s.id}
            onClick={() => setActiveId(s.id)}>
            {s.prop} {s.title}
          </button>
        ))}
      </div>

      {active ? (
        <>
          <h2 style={{ marginBottom: 4 }}>{active.title}</h2>
          <p className="subtle" style={{ marginTop: 0 }}>{active.setting} · Levels {active.levels.join(", ")}</p>
          <ScenePlayer scene={active} />
          <div style={{ marginTop: 12 }}>
            <button type="button" className="button secondary" onClick={() => setActiveId(null)}>← Back to all scenes</button>
          </div>
        </>
      ) : (
        <div className="panel" style={{ padding: 20 }}>
          <p style={{ margin: 0 }}>Pick a scene above. Each one runs fully offline inside English Wizard: two characters speak with distinct British voices, Arabic subtitles appear line by line, and a comprehension quiz checks what you caught.</p>
        </div>
      )}
    </main>
  );
}

export default function ScenesPage() {
  return (
    <Suspense fallback={<main id="main-content" style={{ padding: 48 }}><p className="subtle">Loading scene studio…</p></main>}>
      <ScenesInner />
    </Suspense>
  );
}
