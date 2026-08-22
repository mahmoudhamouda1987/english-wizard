"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCard() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, displayName, password }),
    });
    const p = await r.json();
    setBusy(false);
    if (!r.ok) {
      setError(p.error ?? "Unable to continue");
      return;
    }
    router.push(nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard");
    router.refresh();
  }

  return (
    <main id="main-content" className="auth-shell">
      <section className="auth-art">
        <div className="art-logo"><img src="/logo.png" alt="" width={44} height={44} /> English Wizard</div>
        <h2>Learn English the way it is really spoken.</h2>
        <ul className="auth-points">
          <li><span className="pt-icon">✓</span> A 5-minute diagnostic places your true CEFR level</li>
          <li><span className="pt-icon">✓</span> Every lesson builds real, measured evidence of progress</li>
          <li><span className="pt-icon">✓</span> Spaced review turns mistakes into lasting memory</li>
          <li><span className="pt-icon">✓</span> Speaking, listening, reading and writing in one journey</li>
        </ul>
        <blockquote className="auth-quote">
          &ldquo;I finally know what my level actually is — and exactly what to learn next.&rdquo;
          <strong>Learner pilot, B1 → B2 in one term</strong>
        </blockquote>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">
          <img src="/logo.png" alt="English Wizard logo" width={56} height={56} style={{ borderRadius: 13 }} />
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="subtle">{mode === "login" ? "Sign in to continue your journey." : "Start with a free placement check today."}</p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="input-wrap">
                <span className="input-icon" aria-hidden="true">👤</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required minLength={2} aria-label="Your name" />
              </div>
            )}
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">✉️</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required aria-label="Email address" />
            </div>
            <div className="input-wrap">
              <span className="input-icon" aria-hidden="true">🔒</span>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (8+ characters)" minLength={8} required aria-label="Password" />
              <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "🙈" : "👁️"}</button>
            </div>
            {error && <p role="alert" className="state-card error" style={{ margin: 0 }}>{error}</p>}
            <button className="button" disabled={busy} style={{ width: "100%" }}>{busy ? "Please wait…" : mode === "login" ? "Sign in →" : "Create account →"}</button>
          </form>
          <button className="link-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "New here? Create a free account" : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return <Suspense fallback={<main id="main-content" style={{ padding: 48 }}><p className="subtle">Loading…</p></main>}><AuthCard /></Suspense>;
}
