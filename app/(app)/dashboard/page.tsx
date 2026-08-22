"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_LESSONS } from "@/src/domain/all-lessons";

interface Dash {
  firstName: string;
  level: string;
  levelIndex: number;
  nextLevel: string;
  overallPercent: number;
  xp: number;
  nextXp: number;
  streak: number;
  freezes: number;
  quests: Array<{ id: string; label: string; target: number; current: number; xp: number }>;
  week: Array<{ label: string; value: number }>;
  skills: Array<{ label: string; value: number }>;
  series: number[];
  masteryTopics: Array<{ topic: string; percent: number }>;
  reviewDue: number;
  dailyMinutes: number;
  currentLessonId: string | null;
  completedLessons: number;
  totalLessons: number;
  vocabularyWords: number;
}

const NAV: Array<{ section?: string; items: Array<{ icon: string; label: string; href: string; sub?: boolean }> }> = [
  { items: [{ icon: "▦", label: "Dashboard", href: "/dashboard" }, { icon: "🧭", label: "My Journey", href: "/learning-path" }, { icon: "📚", label: "Lessons", href: "/learn" }] },
  { section: "", items: [{ icon: "⚡", label: "Practice", href: "/practice", sub: true }] },
  { items: [{ icon: "🌍", label: "Worlds & Missions", href: "/worlds" }] },
  { items: [{ icon: "🎯", label: "Review & Mastery", href: "/review" }, { icon: "📈", label: "Progress", href: "/progress" }] },
  { items: [{ icon: "🎁", label: "Invite Friends", href: "/referral" }] },
  {
    section: "Skills",
    items: [
      { icon: "👂", label: "English Ear", href: "/english-ear" },
      { icon: "🎙️", label: "Say It Better", href: "/say-it-better" },
      { icon: "📖", label: "Reading Engine", href: "/reading" },
      { icon: "✍️", label: "Writing", href: "/writing" },
      { icon: "🔤", label: "Vocabulary", href: "/vocabulary" },
      { icon: "🧩", label: "Grammar", href: "/grammar" },
      { icon: "💡", label: "Thinking in English", href: "/thinking-in-english" },
    ],
  },
  {
    section: "Exams & More",
    items: [
      { icon: "🎓", label: "Tests & Exams", href: "/pathways" },
      { icon: "💬", label: "Community", href: "/community" },
      { icon: "🤖", label: "Teacher AI", href: "/teacher-help" },
    ],
  },
];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

function Radar({ skills }: { skills: Array<{ label: string; value: number }> }) {
  const cx = 110, cy = 105, r = 78;
  const n = Math.max(3, skills.length);
  const point = (i: number, radius: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius];
  };
  const poly = skills.map((s, i) => point(i, (s.value / 100) * r).join(",")).join(" ");
  return (
    <svg viewBox="0 0 220 210" className="radar" role="img" aria-label="Skills overview radar chart">
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={skills.map((_, i) => point(i, r * f).join(",")).join(" ")} fill="none" stroke="#e4e8f0" strokeWidth="1" />
      ))}
      {skills.map((s, i) => {
        const [x, y] = point(i, r + 16);
        return <text key={s.label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#5b6272">{s.label}</text>;
      })}
      {skills.map((s, i) => {
        const [x, y] = point(i, r);
        return (
          <g key={`${s.label}-v`}>
            <circle cx={x} cy={y} r="2" fill="#6840d6" />
            <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="#172033">{s.value}</text>
          </g>
        );
      })}
      <polygon points={poly} fill="rgba(104,64,214,.18)" stroke="#6840d6" strokeWidth="2" />
    </svg>
  );
}

function LineChart({ series }: { series: number[] }) {
  if (series.length < 2) return <div className="empty">Your progress curve appears after a few activities.</div>;
  const w = 320, h = 150, pad = 10;
  const min = Math.min(...series, 0), max = 100;
  const pts = series.map((v, i) => [pad + (i * (w - pad * 2)) / (series.length - 1), h - pad - ((v - min) / (max - min)) * (h - pad * 2)]);
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="linechart" role="img" aria-label="Progress over time line chart">
      {[25, 50, 75, 100].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={h - pad - (g / 100) * (h - pad * 2)} y2={h - pad - (g / 100) * (h - pad * 2)} stroke="#eef0f7" strokeWidth="1" />
      ))}
      <path d={path} fill="none" stroke="#6840d6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#6840d6" />
      <text x={last[0] - 8} y={last[1] - 10} fontSize="11" fontWeight="800" textAnchor="end">{series[series.length - 1]}%</text>
    </svg>
  );
}

function Donut({ percent }: { percent: number }) {
  const r = 42, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 110 110" width="96" height="96" role="img" aria-label={`Weekly goal ${percent}% complete`}>
      <circle cx="55" cy="55" r={r} fill="none" stroke="#eceefc" strokeWidth="10" />
      <circle
        cx="55" cy="55" r={r} fill="none" stroke="#6840d6" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(percent / 100) * c} ${c}`} transform="rotate(-90 55 55)"
      />
      <text x="55" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill="#172033">{percent}%</text>
      <text x="55" y="70" textAnchor="middle" fontSize="9" fill="#5b6272">of weekly goal</text>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dash | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const currentLessonTitle = useMemo(() => {
    if (!data?.currentLessonId) return null;
    return ALL_LESSONS.find((l) => l.id === data.currentLessonId)?.title ?? data.currentLessonId.replace(/^lesson-/, "").replace(/prea1/i, "Pre-A1").replace(/-/g, " ");
  }, [data]);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (r) => {
        const payload = await r.json();
        if (!r.ok) throw new Error(payload.error ?? "Unable to load your dashboard.");
        setData(payload as Dash);
      })
      .catch((reason) => {
        if (String(reason?.message ?? reason).toLowerCase().includes("authentication")) router.push("/auth");
        else setError(reason instanceof Error ? reason.message : "Unable to load your dashboard.");
      });
  }, [router]);

  const flatNav = useMemo(() => NAV.flatMap((g) => g.items.map((i) => ({ ...i }))), []);
  function search(e: React.FormEvent) {
    e.preventDefault();
    const hit = flatNav.find((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
    if (hit && query.trim()) router.push(hit.href);
  }

  const planItems = [
    { icon: "🔤", label: "Vocabulary", href: "/vocabulary" },
    { icon: "👂", label: "Listening (English Ear)", href: "/english-ear" },
    { icon: "🎙️", label: "Speaking (Say It Better)", href: "/say-it-better" },
    { icon: "📖", label: "Reading", href: "/reading" },
  ];

  const sessionTypes = [
    { icon: "⚡", name: "Quick Quest", time: "10–15 min", desc: "Quick practice", href: "/practice" },
    { icon: "🗺️", name: "Standard Journey", time: "30–45 min", desc: "Build your skills", href: "/learning-path" },
    { icon: "🎓", name: "Deep Study", time: "60+ min", desc: "Go deeper", href: "/learn" },
    { icon: "🏆", name: "Boss Mission", time: "Challenge", desc: "Hard missions", href: "/worlds" },
  ];

  const achievements = [
    ...(data && data.streak >= 3 ? [{ icon: "🔥", title: `${data.streak}-Day Streak`, sub: "Learning days in a row", xp: "+200 XP" }] : []),
    ...(data && data.overallPercent >= 60 ? [{ icon: "🏅", title: "Consistency Champion", sub: `Average skill strength ${data.overallPercent}%`, xp: "+100 XP" }] : []),
    ...(data && data.completedLessons >= 1 ? [{ icon: "📘", title: "First Steps", sub: `${data.completedLessons} lesson${data.completedLessons === 1 ? "" : "s"} completed`, xp: "+50 XP" }] : []),
  ];

  const levels = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];

  if (error) return <main id="main-content" style={{ maxWidth: 720, margin: "80px auto", padding: 24 }}><p role="alert" className="state-card error">{error}</p><a className="button secondary" href="/auth">Sign in</a></main>;

  return (
    <>
      <main id="main-content" className="dash-main">
        <header className="dash-header">
          <div>
            <h1>{greeting()}{data ? `, ${data.firstName}!` : "!"} 👋</h1>
            <p className="subtle">Let&rsquo;s continue your journey to English mastery.</p>
          </div>
          <form className="searchbox" role="search" onSubmit={search}>
            <input aria-label="Search anything" placeholder="Search anything…" value={query} onChange={(e) => setQuery(e.target.value)} />
            <kbd>Ctrl K</kbd>
          </form>
          <div className="header-widgets">
            <span className="streak-pill" title="Daily learning streak">🔥 {data ? data.streak : 0} · <span title="Streak freezes">🧊 {data ? data.freezes : 0}</span></span>
            <a className="bell" href="/review" aria-label={`Review queue, ${data?.reviewDue ?? 0} due`}>🔔{data && data.reviewDue > 0 ? <b className="badge">{Math.min(9, data.reviewDue)}</b> : null}</a>
            <a className="avatar" href="/settings" aria-label="Profile settings">{data ? data.firstName.slice(0, 2).toUpperCase() : "EW"}</a>
          </div>
        </header>

        <section className="stat-strip" aria-label="Learning snapshot">
          <div className="stat-tile"><strong>{data ? data.completedLessons : 0}<small> / {data ? data.totalLessons : 28}</small></strong><span>Lessons completed</span></div>
          <a className="stat-tile" href={data?.currentLessonId ? `/learn?lesson=${encodeURIComponent(data.currentLessonId)}` : "/diagnostic"}>
            <strong>{currentLessonTitle ?? "Placement check"}</strong>
            <span>Next best action →</span>
          </a>
          <a className="stat-tile" href="/review"><strong>{data ? data.reviewDue : 0}</strong><span>Review cards due →</span></a>
        </section>

        {data && (
          <section className="quest-strip" aria-label="Daily quests">
            {data.quests.map((q) => (
              <div className={`stat-tile quest-tile ${q.current >= q.target ? "done" : ""}`} key={q.id}>
                <div className="quest-head"><strong>{q.label}</strong><em className="xp-tag">+{q.xp} XP</em></div>
                <div className="track"><span style={{ width: `${Math.round((q.current / q.target) * 100)}%` }} /></div>
                <small className="subtle">{q.current >= q.target ? "Complete ✓" : `${q.current}/${q.target}`}</small>
              </div>
            ))}
          </section>
        )}

        {!data && !error && <div className="state-card">Loading your command center…</div>}

        {data && (
          <>
            <div className="hero-row">
              <section className="hero-card" aria-label="Level progress">
                <p>You are on your way to</p>
                <h2>{data.nextLevel} – {data.levelIndex >= 3 ? "Upper-Intermediate" : data.levelIndex <= 0 ? "Beginner" : data.levelIndex === 1 ? "Elementary" : data.levelIndex === 2 ? "Intermediate" : data.levelIndex === 4 ? "Advanced" : "Proficient"} <span className="info-dot" title="Evidence-based internal estimate">ⓘ</span></h2>
                <div className="hero-progress">
                  <div className="hero-progress-head"><span>Overall Progress</span><strong>{data.overallPercent}%</strong></div>
                  <div className="track light"><span style={{ width: `${data.overallPercent}%` }} /></div>
                  <p className="xp-line">XP <strong>{data.xp.toLocaleString()}</strong> / {data.nextXp.toLocaleString()}</p>
                </div>
                <a className="button hero-btn" href={data.currentLessonId ? `/learn?lesson=${encodeURIComponent(data.currentLessonId)}` : "/diagnostic"}>Continue Journey →</a>
                <div className="mountain" aria-hidden="true">⛰️<span>🚩</span></div>
              </section>

              <aside className="goal-card panel">
                <div className="panel-title"><h3>Weekly Goal</h3><a href="/settings">Edit</a></div>
                <div className="goal-body">
                  <Donut percent={Math.min(100, Math.round((data.week.filter((d) => d.value > 0).length / 7) * 100))} />
                  <ul className="goal-stats">
                    <li><span>Goal</span><strong>{data.dailyMinutes * 7}m</strong></li>
                    <li><span>Active days</span><strong>{data.week.filter((d) => d.value > 0).length}/7</strong></li>
                    <li><span>Streak</span><strong>{data.streak} 🔥</strong></li>
                  </ul>
                </div>
                <div className="week-dots">
                  {data.week.map((day) => (
                    <span key={day.label} className={day.value > 0 ? "wdot done" : "wdot"} title={`${day.label}: ${day.value > 0 ? "active" : "no activity"}`}>{day.value > 0 ? "✓" : day.label}</span>
                  ))}
                </div>
              </aside>

              <aside className="panel plan-card">
                <div className="panel-title"><h3>Today&rsquo;s Plan</h3><span>📅</span></div>
                <ul className="plan-list">
                  {planItems.map((item) => (
                    <li key={item.label}>
                      <a href={item.href}><span aria-hidden="true">{item.icon}</span> {item.label}</a>
                      <small>{Math.max(10, Math.round(data.dailyMinutes / planItems.length))} min</small>
                    </li>
                  ))}
                </ul>
                <a className="button start-plan" href={data.currentLessonId ? "/learn" : "/diagnostic"}>▶ Start Plan</a>
              </aside>
            </div>

            <div className="session-cards">
              {sessionTypes.map((s) => (
                <a className="session-card" href={s.href} key={s.name}>
                  <span className="sc-icon" aria-hidden="true">{s.icon}</span>
                  <strong>{s.name}</strong>
                  <small className="sc-time">{s.time}</small>
                  <small>{s.desc}</small>
                </a>
              ))}
            </div>

            <div className="grid-three">
              <section className="panel">
                <div className="panel-title"><h3>Skills Overview</h3><a href="/progress">View detailed</a></div>
                <Radar skills={data.skills} />
              </section>
              <section className="panel">
                <div className="panel-title"><h3>Progress Over Time</h3><a href="/progress">View analytics</a></div>
                <LineChart series={data.series.length >= 2 ? data.series : [data.overallPercent, data.overallPercent]} />
              </section>
              <section className="panel">
                <div className="panel-title"><h3>Mastery</h3><a href="/mistakes">View all</a></div>
                {(data.masteryTopics.length ? data.masteryTopics : data.skills.slice(0, 5).map((s) => ({ topic: s.label.toLowerCase(), percent: s.value }))).map((t) => (
                  <div className="mastery-row" key={t.topic}>
                    <span>{t.topic.replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                    <div className="track"><span style={{ width: `${t.percent}%` }} /></div>
                    <strong>{t.percent}%</strong>
                  </div>
                ))}
              </section>
            </div>

            <div className="grid-two-wide">
              <section className="panel">
                <div className="panel-title"><h3>Continue Learning</h3><a className="explore-worlds" href="/worlds">Explore Worlds &amp; Missions</a></div>
                <div className="continue-grid">
                  {[
                    { badge: "Listening", color: "#3b82f6", title: "English Ear drill", meta: "Connected speech", href: "/english-ear", pct: data.skills[0]?.value ?? 40 },
                    { badge: "Reading", color: "#10b981", title: "Reading Engine", meta: currentLessonTitle ? `Lesson · ${currentLessonTitle.slice(0, 26)}` : "New passage", href: "/reading", pct: data.skills[2]?.value ?? 35 },
                    { badge: "Grammar", color: "#f59e0b", title: "Grammar in context", meta: "Noticing → production", href: "/learn", pct: data.skills[4]?.value ?? 30 },
                    { badge: "Speaking", color: "#ef4444", title: "Say It Better", meta: "Upgrade your phrasing", href: "/say-it-better", pct: data.skills[1]?.value ?? 45 },
                  ].map((card) => (
                    <a className="continue-card" href={card.href} key={card.badge}>
                      <div className="cc-thumb" style={{ background: `linear-gradient(135deg, ${card.color}, #6840d6)` }}>
                        <span className="cc-badge">{card.badge}</span>
                      </div>
                      <strong>{card.title}</strong>
                      <small>{card.meta}</small>
                      <div className="track"><span style={{ width: `${card.pct}%` }} /></div>
                    </a>
                  ))}
                </div>
              </section>

              <div className="side-stack">
                <section className="panel vocab-card">
                  <div className="vocab-body">
                    <div>
                      <strong className="vocab-num">{data.vocabularyWords.toLocaleString()}</strong>
                      <span>Words learned</span>
                    </div>
                    <div className="vocab-tiles" aria-hidden="true"><i>A</i><i>字</i></div>
                  </div>
                  <a className="button practice-vocab" href="/vocabulary">Practice Vocabulary</a>
                </section>

                <section className="panel milestone-card">
                  <span className="milestone-medal" aria-hidden="true">🎖️</span>
                  <div>
                    <strong>Next Milestone</strong>
                    <p className="subtle">Reach 75% average strength to unlock the {data.nextLevel} checkpoint test.</p>
                    <a className="link-arrow" href="/diagnostic">Preview Test →</a>
                  </div>
                </section>
              </div>
            </div>

            <div className="grid-bottom">
              <section className="panel">
                <div className="panel-title"><h3>Your Learning Path</h3><a href="/learning-path">Full journey</a></div>
                <div className="level-path">
                  {levels.map((lv, i) => (
                    <div key={lv} className={`level-step ${i <= data.levelIndex ? "reached" : ""} ${lv === data.level ? "current" : ""}`}>
                      <span className="lv-dot">{lv}</span>
                      <small>{["Starter", "Beginner", "Elementary", "Intermediate", "Upper-Int.", "Advanced", "Proficient"][i]}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel buddy-card">
                <div className="panel-title"><h3>AI Study Buddy</h3><span className="beta-pill">Beta</span></div>
                <div className="buddy-row">
                  <span className="buddy-avatar" aria-hidden="true">🤖</span>
                  <p>Hi {data.firstName}! I&rsquo;m here to help you learn smarter — ask for explanations, examples or feedback.</p>
                </div>
                <a className="button secondary buddy-btn" href="/teacher-help">Ask me anything</a>
              </section>

              <section className="panel">
                <div className="panel-title"><h3>Recent Achievements</h3><a href="/achievements">View all</a></div>
                {achievements.length ? achievements.map((a) => (
                  <div className="ach-row" key={a.title}>
                    <span className="ach-icon" aria-hidden="true">{a.icon}</span>
                    <div><strong>{a.title}</strong><small>{a.sub}</small></div>
                    <em className="xp-tag">{a.xp}</em>
                  </div>
                )) : <p className="empty">Complete your first activity to earn achievements.</p>}
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}
