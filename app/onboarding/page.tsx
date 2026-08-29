"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/app/lib/track";

/* ═══════════════════════════════════════════════════════════════════════
 * PREMIUM ONBOARDING (Part 2) — a 5-screen visual story:
 * Welcome → Discover Your Level → Personalised Learning → Your Journey →
 * Start LevelQuest. Rich CSS-only visual storytelling (animated level path,
 * skill profile, journey map), reduced-motion aware, keyboard navigable.
 * ═══════════════════════════════════════════════════════════════════════ */

const LEVELS = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
const LEVEL_SPAN: Record<string, string> = { "Pre-A1": "#94a3b8", A1: "#38bdf8", A2: "#34d399", B1: "#fbbf24", B2: "#fb923c", C1: "#f87171", C2: "#a855f7" };

const GOALS = ["Speak confidently", "Improve work English", "Travel comfortably", "Understand movies and podcasts", "Build everyday vocabulary", "Write more accurately"];
const GOAL_ICONS = ["🗣️", "💼", "✈️", "🎬", "📚", "✍️"];

const SKILLS = [
  { icon: "🎧", label: "Listening", pct: 78 },
  { icon: "🗣️", label: "Speaking", pct: 64 },
  { icon: "📖", label: "Reading", pct: 86 },
  { icon: "🔤", label: "Grammar", pct: 72 },
  { icon: "📚", label: "Vocabulary", pct: 81 },
];

const JOURNEY = [
  { icon: "🔍", label: "Discover", sub: "LevelQuest finds your level" },
  { icon: "📗", label: "Learn", sub: "Lessons built for you" },
  { icon: "🛠️", label: "Practice", sub: "Skills become habits" },
  { icon: "🏅", label: "Master", sub: "Evidence you can show" },
  { icon: "🚀", label: "Advance", sub: "On to the next band" },
];

const FLOATING_WORDS = ["confident", "fluent", "precise", "expressive", "natural", "bold", "clear"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [screen, setScreen] = useState<"welcome" | "setup">("welcome");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("Arabic");
  const [targetLevel, setTargetLevel] = useState("B1");
  const [dailyMinutes, setDailyMinutes] = useState(20);
  const [goals, setGoals] = useState<string[]>(["Speak confidently"]);

  useEffect(() => {
    track("onboarding_started");
  }, []);

  /* Keyboard navigation between story screens (Part 28). */
  useEffect(() => {
    if (screen !== "welcome") return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "Enter") setStep((s) => (s < 4 ? s + 1 : s));
      if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen]);

  function toggleGoal(goal: string) {
    setGoals((c) => (c.includes(goal) ? c.filter((g) => g !== goal) : [...c, goal]));
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
      // Begin the 7-day guided trial (idempotent) so premium features are available during LevelQuest.
      try { await fetch("/api/trial", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }); } catch { /* trial start must never block onboarding */ }
      track("onboarding_completed", { targetLevel, dailyMinutes, goals });
      track("levelquest_started");
      router.push("/diagnostic");
    } catch (r) {
      setError(r instanceof Error ? r.message : "Unable to start your journey.");
    } finally {
      setBusy(false);
    }
  }

  /* ── Shared premium chrome ── */
  const chrome = (children: React.ReactNode, stepKey: number | string) => (
    <main id="main-content" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 20px", background: "radial-gradient(1200px 700px at 15% -10%, #1e2a6d 0%, transparent 55%), radial-gradient(1000px 600px at 110% 110%, #3b1a5e 0%, transparent 50%), linear-gradient(165deg, #0b1029 0%, #131a45 55%, #1c1240 100%)", color: "white", position: "relative", overflow: "hidden" }}>
      {/* Aurora orbs + starfield (pure CSS, reduced-motion aware) */}
      <div aria-hidden="true" className="ob-orb" style={{ top: "-14%", left: "-10%", background: "radial-gradient(circle, rgba(99,102,241,.32), transparent 65%)" }} />
      <div aria-hidden="true" className="ob-orb" style={{ bottom: "-18%", right: "-12%", background: "radial-gradient(circle, rgba(168,85,247,.28), transparent 65%)", animationDelay: "-6s" }} />
      <div aria-hidden="true" className="ob-stars" />
      <div key={stepKey} style={{ position: "relative", width: "100%", maxWidth: 700, textAlign: "center", animation: "obIn .55s cubic-bezier(.22,1,.36,1)" }}>{children}</div>
      <style>{ONBOARDING_CSS}</style>
    </main>
  );

  /* ── Story screens ── */
  if (screen === "welcome") {
    return chrome(
      <>
        {step === 0 && (
          <>
            <div className="ob-wizard" aria-hidden="true">🧙</div>
            <p className="ob-eyebrow">Welcome to English Wizard</p>
            <h1 className="ob-h1">Your personalised journey to<br /><span className="ob-grad">confident English</span> starts here.</h1>
            <p className="ob-sub">A smarter way to learn — built around your level, your goals, and your progress.</p>
            <div className="ob-words" aria-hidden="true">
              {FLOATING_WORDS.slice(0, 6).map((w, i) => <span key={`${w}-${i}`} className="ob-word" style={{ animationDelay: `${i * 0.7}s` }}>{w}</span>)}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="ob-eyebrow">Discover Your Level</p>
            <h1 className="ob-h1">We start by finding <span className="ob-grad">exactly</span> where you are today.</h1>
            <p className="ob-sub">English Wizard measures your current ability across seven CEFR levels — so your path is built for you, not a generic checklist.</p>
            <LevelPath active />
          </>
        )}

        {step === 2 && (
          <>
            <p className="ob-eyebrow">Personalised Learning</p>
            <h1 className="ob-h1">Every lesson adapts to your <span className="ob-grad">strengths and gaps</span>.</h1>
            <p className="ob-sub">Your skills are continuously profiled — so you always practise the right thing at the right time.</p>
            <div className="ob-skills">
              {SKILLS.map((s, i) => (
                <div key={s.label} className="ob-skill" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                  <span className="ob-skill-icon">{s.icon}</span>
                  <div className="ob-skill-body">
                    <div className="ob-skill-head"><span>{s.label}</span><strong>{s.pct}%</strong></div>
                    <div className="ob-skill-track"><span style={{ width: `${s.pct}%`, animationDelay: `${0.4 + i * 0.12}s` }} /></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="ob-note">Illustration of a skill profile — yours will come from your own LevelQuest result.</p>
          </>
        )}

        {step === 3 && (
          <>
            <p className="ob-eyebrow">Your Journey</p>
            <h1 className="ob-h1">Discover → Learn → Practice → Master → <span className="ob-grad">Advance</span>.</h1>
            <p className="ob-sub">A clear, motivating path that carries you from your first words to confident, fluent communication.</p>
            <div className="ob-journey">
              {JOURNEY.map((j, i) => (
                <div key={j.label} className="ob-jstep" style={{ animationDelay: `${0.2 + i * 0.18}s` }}>
                  <div className="ob-jnode">{j.icon}</div>
                  <strong>{j.label}</strong>
                  <span>{j.sub}</span>
                  {i < JOURNEY.length - 1 && <div className="ob-jlink" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <p className="ob-eyebrow">Start Assessment</p>
            <h1 className="ob-h1">Your first mission is <span className="ob-grad">LevelQuest</span> — our adaptive English placement assessment.</h1>
            <div className="ob-mission">
              <div className="ob-mission-grid">
                <div><strong>⏱️ ~30 min</strong><span>adaptive maximum</span></div>
                <div><strong>🎚️ Adaptive</strong><span>difficulty follows you</span></div>
                <div><strong>🎧 🗣️ ❓</strong><span>listening · speaking · choice</span></div>
                <div><strong>📄 Report</strong><span>personalised + downloadable</span></div>
              </div>
              <p className="ob-note" style={{ marginBottom: 0 }}>Pre-A1 to C2 coverage — your result unlocks your personal path.</p>
            </div>
          </>
        )}

        {/* Controls */}
        <div className="ob-controls">
          {step > 0 && <button className="ob-back" onClick={() => setStep(step - 1)}>← Back</button>}
          <button className="ob-cta" onClick={() => { if (step < 4) setStep(step + 1); else setScreen("setup"); }}>
            {step === 0 ? "Begin My Journey" : step === 1 ? "Discover My Level" : step === 2 ? "See How It Adapts" : step === 3 ? "Show My Path" : "Continue"} →
          </button>
        </div>

        {/* Progress dots */}
        <div className="ob-dots" role="tablist" aria-label="Onboarding screens">
          {[0, 1, 2, 3, 4].map((i) => (
            <button key={i} role="tab" aria-selected={i === step} aria-label={`Screen ${i + 1}`} onClick={() => setStep(i)} className={i === step ? "ob-dot active" : "ob-dot"} />
          ))}
        </div>
      </>,
      step,
    );
  }

  /* ── Setup screen ── */
  return (
    <main id="main-content" style={{ minHeight: "100vh", padding: "48px 24px", maxWidth: 720, margin: "0 auto", background: "#f7f8fc" }}>
      <p className="eyebrow" style={{ textAlign: "center" }}>Almost there</p>
      <h1 style={{ textAlign: "center", fontSize: 30, margin: "8px 0 6px", fontWeight: 800 }}>Tell us a little about you</h1>
      <p className="subtle" style={{ textAlign: "center", margin: "0 0 28px" }}>This lets English Wizard personalize your LevelQuest and learning path.</p>

      <section className="panel" style={{ display: "grid", gap: 16, padding: 28 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" style={{ padding: 12, borderRadius: 10, border: "1px solid #dfe3ec", fontSize: 15 }} />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
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
                <button key={goal} type="button" onClick={() => toggleGoal(goal)} aria-pressed={active} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", borderRadius: 10, border: active ? "2px solid #6840d6" : "1px solid #dfe3ec", background: active ? "#f0ebff" : "white", cursor: "pointer", textAlign: "left", fontSize: 13.5, transition: "all .15s" }}>
                  <span>{GOAL_ICONS[i]}</span> {goal} {active && <span style={{ marginLeft: "auto", color: "#6840d6", fontWeight: 700 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error && <p role="alert" style={{ color: "#a53b3b" }}>{error}</p>}
        <button className="button" disabled={busy || !name.trim() || goals.length === 0} onClick={startDiagnostic} style={{ padding: 15 }}>
          {busy ? "Preparing your profile…" : "Start LevelQuest Assessment →"}
        </button>
      </section>
    </main>
  );
}

/* ── Animated 7-level path (screen 2) ── */
function LevelPath({ active }: { active: boolean }) {
  const [lit, setLit] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setLit((n) => (n >= LEVELS.length + 2 ? 1 : n + 1)), 420);
    return () => clearInterval(t);
  }, [active]);
  return (
    <div className="ob-levelpath" aria-label="Seven CEFR levels from Pre-A1 to C2">
      {LEVELS.map((lv, i) => {
        const on = i < lit;
        return (
          <div key={lv} style={{ display: "flex", alignItems: "center" }}>
            <div className={on ? "ob-level lit" : "ob-level"} style={{ ["--lv" as string]: LEVEL_SPAN[lv], animationDelay: `${i * 0.08}s` }}>{lv}</div>
            {i < LEVELS.length - 1 && <div className={on ? "ob-lvlink lit" : "ob-lvlink"} style={{ transitionDelay: `${i * 0.08}s` }} />}
          </div>
        );
      })}
      <span className="ob-you" style={{ left: `${Math.min(92, Math.max(4, (lit - 1) * 15.2))}%`, opacity: lit > 0 && lit <= LEVELS.length ? 1 : 0 }}>YOU</span>
    </div>
  );
}

/* ── Scoped styles ── */
const ONBOARDING_CSS = `
@keyframes obIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes obFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-16px) scale(1.04)}}
@keyframes obTwinkle{0%,100%{opacity:.25}50%{opacity:.9}}
@keyframes obFill{from{width:0}}
.ob-orb{position:absolute;width:46vw;height:46vw;min-width:340px;min-height:340px;border-radius:50%;filter:blur(60px);animation:obFloat 14s ease-in-out infinite;pointer-events:none}
.ob-stars{position:absolute;inset:0;background-image:radial-gradient(1.5px 1.5px at 12% 22%,rgba(255,255,255,.8),transparent),radial-gradient(1px 1px at 34% 68%,rgba(255,255,255,.6),transparent),radial-gradient(1.5px 1.5px at 58% 12%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 72% 44%,rgba(255,255,255,.5),transparent),radial-gradient(1.5px 1.5px at 88% 78%,rgba(255,255,255,.7),transparent),radial-gradient(1px 1px at 22% 84%,rgba(255,255,255,.5),transparent);animation:obTwinkle 5s ease-in-out infinite;pointer-events:none}
.ob-wizard{display:inline-flex;align-items:center;justify-content:center;width:84px;height:84px;border-radius:24px;font-size:42px;background:linear-gradient(135deg,#6840d6,#8b5cf6);box-shadow:0 16px 44px rgba(104,64,214,.5),0 0 0 8px rgba(139,92,246,.14);margin-bottom:20px;animation:obFloat 5s ease-in-out infinite}
.ob-eyebrow{letter-spacing:.18em;text-transform:uppercase;font-size:12.5px;font-weight:800;color:#a5b4fc;margin:0 0 12px}
.ob-h1{font-size:clamp(27px,4.6vw,40px);line-height:1.16;margin:0 0 14px;font-weight:900;letter-spacing:-.01em}
.ob-grad{background:linear-gradient(90deg,#a78bfa,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent}
.ob-sub{font-size:16px;line-height:1.7;opacity:.86;max-width:560px;margin:0 auto 26px}
.ob-note{font-size:11.5px;opacity:.55;margin:14px auto 0;max-width:480px}
.ob-words{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:8px}
.ob-word{padding:7px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.07);font-weight:700;font-size:13.5px;animation:obFloat 6s ease-in-out infinite}
.ob-levelpath{position:relative;display:flex;align-items:center;justify-content:center;margin:26px auto 6px;max-width:640px;flex-wrap:wrap;row-gap:14px}
.ob-level{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11.5px;border:2px solid rgba(255,255,255,.16);color:rgba(255,255,255,.4);background:rgba(255,255,255,.05)}
.ob-level.lit{border-color:var(--lv);color:var(--lv);background:color-mix(in srgb,var(--lv) 16%,transparent);box-shadow:0 0 18px color-mix(in srgb,var(--lv) 45%,transparent);animation:obIn .4s ease}
.ob-lvlink{width:20px;height:2px;background:rgba(255,255,255,.14);transition:background .4s}
.ob-lvlink.lit{background:#8b5cf6;box-shadow:0 0 8px rgba(139,92,246,.8)}
.ob-you{position:absolute;top:-26px;transform:translateX(-50%);font-size:10px;font-weight:800;letter-spacing:.1em;background:#8b5cf6;color:white;padding:2px 8px;border-radius:6px;transition:left .4s ease,opacity .3s}
.ob-skills{max-width:440px;margin:4px auto 0;display:grid;gap:10px;text-align:left}
.ob-skill{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:13px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);animation:obIn .5s ease backwards}
.ob-skill-icon{font-size:20px}
.ob-skill-body{flex:1}
.ob-skill-head{display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px}
.ob-skill-head strong{font-variant-numeric:tabular-nums}
.ob-skill-track{height:7px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden}
.ob-skill-track span{display:block;height:100%;border-radius:4px;background:linear-gradient(90deg,#8b5cf6,#67e8f9);animation:obFill 1.1s cubic-bezier(.22,1,.36,1) backwards}
.ob-journey{display:flex;justify-content:center;align-items:flex-start;gap:0;margin:22px auto 0;flex-wrap:wrap;row-gap:18px}
.ob-jstep{display:flex;flex-direction:column;align-items:center;width:108px;position:relative;animation:obIn .5s ease backwards}
.ob-jnode{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;background:rgba(255,255,255,.08);border:2px solid rgba(139,92,246,.65);box-shadow:0 0 16px rgba(139,92,246,.35);margin-bottom:8px}
.ob-jstep strong{font-size:13px}
.ob-jstep span{font-size:10.5px;opacity:.6;margin-top:3px;max-width:96px;line-height:1.4}
.ob-jlink{position:absolute;top:25px;left:calc(50% + 28px);width:52px;height:2px;background:linear-gradient(90deg,rgba(139,92,246,.8),rgba(103,232,249,.5))}
.ob-mission{max-width:520px;margin:6px auto 0;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:20px}
.ob-mission-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px;margin-bottom:12px}
.ob-mission-grid div{display:grid;gap:2px}
.ob-mission-grid strong{font-size:15px}
.ob-mission-grid span{font-size:11px;opacity:.62}
.ob-controls{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:30px;min-height:52px}
.ob-cta{padding:15px 32px;border-radius:14px;border:0;background:linear-gradient(135deg,#6840d6,#8b5cf6);color:white;font-weight:800;font-size:16px;cursor:pointer;box-shadow:0 10px 30px rgba(107,64,214,.45);transition:transform .15s,box-shadow .15s}
.ob-cta:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(107,64,214,.55)}
.ob-back{background:transparent;border:0;color:rgba(255,255,255,.7);font-size:14px;cursor:pointer;padding:10px}
.ob-back:hover{color:white}
.ob-dots{display:flex;justify-content:center;gap:8px;margin-top:22px}
.ob-dot{height:7px;width:8px;border-radius:4px;border:0;cursor:pointer;background:rgba(255,255,255,.25);transition:background .2s,width .2s;padding:0}
.ob-dot.active{width:30px;background:#8b5cf6}
@media (max-width:640px){.ob-jstep{width:88px}.ob-jlink{width:32px;left:calc(50% + 24px)}.ob-level{width:38px;height:38px;font-size:10px}.ob-lvlink{width:12px}.ob-you{display:none}}
@media (prefers-reduced-motion:reduce){.ob-orb,.ob-wizard,.ob-word,.ob-stars,.ob-skill,.ob-jstep,.ob-level.lit,.ob-skill-track span{animation:none !important}}
`;
