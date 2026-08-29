"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { WORLDS_V2, totalExerciseCount } from "@/src/domain/worlds-curriculum";
import type { CEFRLevel } from "@/src/domain/curriculum";
import { IconCheck } from "@/app/components/nav-icons";
import { track } from "@/app/lib/track";

const LEVELS: Array<CEFRLevel | "All"> = ["All", "Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

export default function WorldsPage() {
  const [learnerLevel, setLearnerLevel] = useState<CEFRLevel | null>(null);
  const [filter, setFilter] = useState<CEFRLevel | "All" | null>(null);
  const [openWorld, setOpenWorld] = useState<string | null>(null);

  useEffect(() => {
    track("worlds_entered");
    let cancelled = false;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d?.level) return;
        setLearnerLevel(d.level as CEFRLevel);
        setFilter((prev) => prev ?? (d.level as CEFRLevel));
      })
      .catch(() => { /* filter stays on All */ });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    const f = filter ?? "All";
    return f === "All" ? WORLDS_V2 : WORLDS_V2.filter((w) => w.level === f);
  }, [filter]);

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Learn through worlds"
        title="Worlds & Missions"
        purpose="Every level is a set of worlds. Every world is a coherent story of skills — organised by CEFR level, delivered through missions with real outcomes."
      />

      <div className="filters" role="group" aria-label="Filter worlds by CEFR level">
        <span className="f-label">Level</span>
        {LEVELS.map((lv) => (
          <button
            key={lv}
            type="button"
            className="f-chip"
            data-active={(filter ?? "All") === lv}
            onClick={() => setFilter(lv)}
          >
            {lv === "All" ? "All levels" : lv}
            {lv === learnerLevel ? " · you" : ""}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {visible.map((world) => {
          const exercises = totalExerciseCount(world);
          const isOpen = openWorld === world.id;
          return (
            <section className="world-card" key={world.id} aria-label={`World: ${world.title}`}>
              <div className="wc-band">
                <div>
                  <span className="wc-level">World {world.number} · {world.level}</span>
                  <h2>{world.title}</h2>
                </div>
                <span className="pill" style={{ background: "rgba(255,255,255,.16)", color: "#fff", whiteSpace: "nowrap" }}>
                  ≈ {world.estimatedHours} h · {exercises} exercises
                </span>
              </div>
              <div className="wc-body">
                <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: 1.6 }}>{world.purpose}</p>

                <div className="settings-grid" style={{ gap: 18 }}>
                  <div>
                    <p className="review-section-title" style={{ margin: "0 0 8px" }}>What you will learn</p>
                    <ul className="wc-objectives">
                      {world.willLearn.map((item) => <li key={item}><IconCheck size={13} /> {item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="review-section-title" style={{ margin: "0 0 8px" }}>What you will be able to do</p>
                    <ul className="wc-objectives">
                      {world.canDo.map((item) => <li key={item}><IconCheck size={13} /> {item}</li>)}
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {world.skills.map((s) => <span key={s} className="lc-badge skill">{s}</span>)}
                  {world.topics.slice(0, 4).map((t) => <span key={t} className="lc-badge">{t}</span>)}
                </div>

                <div>
                  <button
                    type="button"
                    className="link-button"
                    style={{ padding: "8px 0" }}
                    aria-expanded={isOpen}
                    onClick={() => setOpenWorld(isOpen ? null : world.id)}
                  >
                    {isOpen ? "Hide missions" : `View ${world.missions.length} missions`}
                  </button>
                  {isOpen ? (
                    <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                      {world.missions.map((mission, i) => {
                        const missionExercises = mission.exercises.reduce((s, e) => s + e.count, 0);
                        return (
                          <div className="mission-row" key={mission.id}>
                            <span className="mi-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                            <span className="mi-body">
                              <strong>{mission.title}</strong>
                              <small>{mission.outcome}</small>
                              <small style={{ marginTop: 4 }}>
                                {missionExercises} exercises · {mission.skills.join(" · ")}
                                {mission.lessonIds.length ? " · delivered through your lessons" : ""}
                              </small>
                            </span>
                            <span className="mi-meta">{mission.estimatedMinutes} min</span>
                          </div>
                        );
                      })}
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                        {world.missions[0]?.lessonIds.slice(0, 1).map((lessonId) => (
                          <Link key={lessonId} className="button" href={`/learn?lesson=${encodeURIComponent(lessonId)}`}>Start this world</Link>
                        ))}
                        <Link className="button secondary" href="/learning-path">See it on my journey</Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
