"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/app/lib/track";

const LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_SPAN = { "Pre-A1": "#94a3b8", A1: "#38bdf8", A2: "#34d399", B1: "#fbbf24", B2: "#fb923c", C1: "#f87171", C2: "#a855f7" } as const;

const GOALS = ["Speak confidently", "Improve work English", "Travel comfortably", "Understand movies and podcasts", "Build everyday vocabulary", "Write more accurately"];
const GOAL_ICONS = ["🗣️", "💼", "✈️", "🎬", "📚", "✍️"];

interface Screen {
  icon: string;
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
}

const SCREENS: Screen[] = [
  { icon: "🧙", eyebrow: "Welcome to English Wizard", title: "Your personalized journey to confident English starts here.", sub: "A smarter way to learn — built around your level, your goals, and your progress.", cta: "Begin My Journey" },
  { icon: "🎯", eyebrow: "Discover Your Level", title: "We start by finding exactly where you are today.", sub: "English Wizard measures your current ability across seven levels so your path is built for you — not a generic checklist.", cta: "Discover My Level" },
  { icon: "🧩", eyebrow: "Personalized Learning", title: "Every lesson adapts to your strengths and gaps.", sub: "Your listening, speaking, vocabulary, grammar and reading are profiled — so you always practise the right thing at the right time.", cta: "See How It Adapts" },
  { icon: "🧭", eyebrow: "Your Journey", title: "Discover → Learn → Practice → Master → Advance.", sub: "A clear, motivating path that carries you from your first words to confident, fluent communication.", cta: "Show My Path" },
  { icon: "🚀", eyebrow: "Start Assessment", title: "Your first mission is LevelCheck — our adaptive English placement assessment.", sub: "About 30 minutes · Adaptive difficulty · Listening, speaking and multiple-choice · Pre-A1 to C2 · A personalized, downloadable report at the end.", cta: "Start LevelCheck" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState<"welcome" | "setup" | "levelquest">("welcome");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("Arabic");
  const [targetLevel, setTargetLevel] = useState("B1");
  const [dailyMinutes, setDailyMinutes] = useState(20);
  const [goals, setGoals] = useState<string[]>(["Speak confidently"]);

  function toggleGoal(goal: string) {
    setGoals((c) => (c.includes(goal) ? c.filter((g) => g !== goal) : [...c, goal]));
  }

  function advance() {
    if (step < SCREENS.length - 1) setStep(step + 1);
    else setScreen("setup");
  }

  async function startDiagnostic() {
    setBusy(true);
    setError(null);
    try {
      const state = await fetch("/api/learner-state", { method: "POST" });
      const statePayload = await state.json();
      if (!state.ok) throw new Error(statePayload.error ?? "Unable to create your learner state.");
      const profile = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name, nativeLanguage, targetLevel, dailyMinutes, goals }),
      });
      const profilePayload = await profile.json();
      if (!profile.ok) throw new Error(profilePayload.error ?? "Unable to save your profile.");
      // Begin the 7-day guided trial (idempotent) so premium features are available during LevelCheck.
      try { await fetch("/api/trial", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); } catch { /* trial start must never block onboarding */ }
      track("onboarding_completed", { name, targetLevel, dailyMinutes, goals });
      track("levelquest_started");
      router.push("/diagnostic");
    } catch (r) {
      setError(r instanceof Error ? r.message : "Unable to start your journey.");
    } finally {
      setBusy(false);
    }
  }

  /* ── Welcome / intro screens ── */
  if (screen === "welcome") {
    const s = SCREENS[step];
    return (
      <main id="main-content" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "linear-gradient(160deg, #0f1535 0%, #1a1f4f 55%, #2a1a4a 100%)", color: "white", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.25, background: "radial-gradient(circle at 20% 20%, rgba(56,189,248,.35), transparent 40%), radial-gradient(circle at 80% 80%, rgba(168,85,247,.35), transparent 40%)" }} />
        <div style={{ position: "relative", maxWidth: 640, width: "100%", textAlign: "center" }}>
          <div key={step} style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ fontSize: 72, marginBottom: 12 }}>{s.icon}</div>
            <p className="eyebrow" style={{ color: "#93c5fd", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 13 }}>{s.eyebrow}</p>
            <h1 style={{ fontSize: 34, lineHeight: 1.2, margin: "16px 0 14px", fontWeight: 800 }}>{s.title}</h1>
            <p style={{ fontSize: 16, lineHeight: 1.6, opacity: 0.85, maxWidth: 520, margin: "0 auto 26px" }}>{s.sub}</p>
            <button onClick={advance} style={{ padding: "15px 30px", borderRadius: 14, border: 0, background: "linear-gradient(135deg, #6840d6, #8b5cf6)", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(107,64,214,.4)", transition: "transform .15s" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
              {s.cta} →
            </button>
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 34, flexWrap: "wrap" }}>
            {SCREENS.map((_, i) => (
              <button key={i} aria-label={`Screen ${i + 1}`} onClick={() => setStep(i)} style={{ height: 6, borderRadius: 3, border: 0, cursor: "pointer", background: i === step ? "#8b5cf6" : "rgba(255,255,255,.25)", transition: "background .2s, width .2s", width: i === step ? 30 : 8 }} />
            ))}
          </div>

          {/* Level progression on discover screen */}
          {step >= 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 28 }}>
              {LEVELS.map((lv, i) => (
                <div key={lv} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: `${LEVEL_SPAN[lv as keyof typeof LEVEL_SPAN]}22`, border: `2px solid ${i <= step ? LEVEL_SPAN[lv as keyof typeof LEVEL_SPAN] : "rgba(255,255,255,.15)"}`, color: i <= step ? LEVEL_SPAN[lv as keyof typeof LEVEL_SPAN] : "rgba(255,255,255,.4)", fontWeight: 800, fontSize: 12, transition: "all .4s" }}>{lv}</div>
                  </div>
                  {i < LEVELS.length - 1 && <div style={{ width: 22, height: 2, background: i <= step ? "#8b5cf6" : "rgba(255,255,255,.15)", transition: "background .4s" }} />}
                </div>
              ))}
            </div>
          )}
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </main>
    );
  }

  /* ── Setup screen (collect profile details) ── */
  if (screen === "setup") {
    return (
      <main id="main-content" style={{ minHeight: "100vh", padding: "40px 24px", maxWidth: 720, margin: "0 auto" }}>
        <p className="eyebrow" style={{ textAlign: "center" }}>Almost there</p>
        <h1 style={{ textAlign: "center", fontSize: 28, margin: "8px 0 6px" }}>Tell us a little about you</h1>
        <p className="subtle" style={{ textAlign: "center", margin: "0 0 28px" }}>This lets English Wizard personalize your LevelCheck and learning path.</p>

        <section className="panel" style={{ display: "grid", gap: 16, padding: 28 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ padding: 12, borderRadius: 10, border: "1px solid #dfe3ec", fontSize: 15 }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Native language</span>
              <input value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #dfe3ec", fontSize: 15 }} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Your goal level</span>
              <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #dfe3ec", fontSize: 15 }}>
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
          </div>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Minutes per day</span>
            <input type="number" min="5" max="180" value={dailyMinutes} onChange={(e) => setDailyMinutes(Number(e.target.value))} style={{ padding: 12, borderRadius: 10, border: "1px solid #dfe3ec", fontSize: 15 }} />
          </label>

          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>What do you want English for?</legend>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {GOALS.map((goal, i) => {
                const active = goals.includes(goal);
                return (
                  <button key={goal} type="button" onClick={() => toggleGoal(goal)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, border: active ? "2px solid #6840d6" : "1px solid #dfe3ec", background: active ? "#f0ebff" : "white", cursor: "pointer", textAlign: "left", fontSize: 13.5, transition: "all .15s" }}>
                    <span>{GOAL_ICONS[i]}</span> {goal} {active && <span style={{ marginLeft: "auto", color: "#6840d6", fontWeight: 700 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {error && <p role="alert" style={{ color: "#a53b3b" }}>{error}</p>}
          <button className="button" disabled={busy || !name.trim() || goals.length === 0} onClick={startDiagnostic} style={{ padding: 15 }}>
            {busy ? "Preparing your profile…" : "Start LevelCheck Assessment →"}
          </button>
        </section>
      </main>
    );
  }

  return null;
}
