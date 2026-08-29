"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LEARNING_SCENES } from "@/src/domain/scenes";
import { ScenePlayer } from "@/app/components/scene-player";
import { PageHeader } from "@/app/components/page-header";
import { IconFilm } from "@/app/components/nav-icons";
import { track } from "@/app/lib/track";
import type { CEFRLevel } from "@/src/domain/learner";

const LEVELS: Array<CEFRLevel | "All"> = ["All", "Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

function SceneCardIcon() {
  return <IconFilm size={20} />;
}

function ScenesInner() {
  const params = useSearchParams();
  const initial = params.get("scene");
  const [activeId, setActiveId] = useState<string | null>(initial && LEARNING_SCENES.some((s) => s.id === initial) ? initial : null);
  const [levelFilter, setLevelFilter] = useState<CEFRLevel | "All" | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>("All");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    track("scenes_entered");
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled) return;
        if (d?.level) setLevelFilter(d.level as CEFRLevel);
        setBooting(false);
      })
      .catch(() => { if (!cancelled) setBooting(false); });
    return () => { cancelled = true; };
  }, []);

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const scene of LEARNING_SCENES) {
      for (const t of scene.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([t]) => t);
  }, []);

  const visible = useMemo(() => {
    return LEARNING_SCENES.filter((s) => {
      const lv = levelFilter ?? "All";
      if (lv !== "All" && !s.levels.includes(lv)) return false;
      if (topicFilter !== "All" && !s.topics.some((t) => t.toLowerCase().includes(topicFilter.toLowerCase()))) return false;
      return true;
    });
  }, [levelFilter, topicFilter]);

  const active = LEARNING_SCENES.find((s) => s.id === activeId) ?? null;

  if (active) {
    return (
      <main id="main-content" className="dash-main">
        <PageHeader
          eyebrow={`Scene · ${active.levels.join(" / ")}`}
          title={active.title}
          purpose={`${active.setting}. Watch and listen, then prove what you understood.`}
          action="All scenes"
          actionHref="/scenes"
        />
        <ScenePlayer scene={active} />
      </main>
    );
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Real-life scenarios"
        title="Scenes"
        purpose="Animated real-life conversations — every voice, subtitle and visual generated inside the platform. Organised by level and topic so you always find the right scene."
      />

      <div className="filters" role="group" aria-label="Filter scenes">
        <span className="f-label">Level</span>
        {LEVELS.map((lv) => (
          <button key={lv} type="button" className="f-chip" data-active={(levelFilter ?? "All") === lv} onClick={() => setLevelFilter(lv)}>
            {lv === "All" ? "All levels" : lv}
          </button>
        ))}
        <span className="f-label" style={{ marginLeft: 10 }}>Topic</span>
        <select aria-label="Filter by topic" value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} style={{ borderRadius: 999, padding: "8px 14px", fontWeight: 700, fontSize: 13 }}>
          <option value="All">All topics</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {booting ? (
        <div className="lib-grid" aria-busy="true" aria-label="Loading scenes">
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 16 }} />)}
        </div>
      ) : visible.length === 0 ? (
        <section className="panel">
          <p className="empty" style={{ margin: 0 }}>
            No scenes match this combination of level and topic yet. Clear the topic filter or choose another level — every level has scenes to watch.
          </p>
        </section>
      ) : (
        <div className="lib-grid">
          {visible.map((scene) => (
            <button key={scene.id} type="button" className="lib-card" style={{ textAlign: "left", font: "inherit", color: "inherit", cursor: "pointer" }} onClick={() => setActiveId(scene.id)}>
              <span className="lc-top">
                <span className="lc-badges">
                  <span className="lc-badge level">{scene.levels[0]}</span>
                  <span className="lc-badge skill">{scene.topics[0]}</span>
                </span>
                <h3><span aria-hidden="true" style={{ marginRight: 8 }}><SceneCardIcon /></span>{scene.title}</h3>
                <p>{scene.setting}</p>
              </span>
              <span className="lc-foot">
                <span>{scene.levels.length > 1 ? `${scene.levels[0]}–${scene.levels[scene.levels.length - 1]}` : scene.levels[0]}</span>
                <span>{scene.lines.length} lines · {scene.quiz.length} questions</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </main>
  );
}

export default function ScenesPage() {
  return (
    <Suspense fallback={
      <main id="main-content" className="dash-main" aria-busy="true">
        <div className="skeleton skeleton-title" />
        <div className="lib-grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 150, borderRadius: 16 }} />)}</div>
      </main>
    }>
      <ScenesInner />
    </Suspense>
  );
}
