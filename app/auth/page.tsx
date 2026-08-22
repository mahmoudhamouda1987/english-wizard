"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCard() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
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
      <section className="auth-card">
        <img src="/logo.png" alt="English Wizard logo" width={64} height={64} style={{ borderRadius: 14, marginBottom: 10 }} />
        <h1>{mode === "login" ? "Welcome back" : "Create your learner account"}</h1>
        <p className="subtle">Your progress, mistakes, mastery and learning path are saved to your account.</p>
        <form onSubmit={submit}>
          {mode === "register" && <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" required minLength={2} />}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={8} required />
          {error && <p className="state-card error">{error}</p>}
          <button className="button" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="link-button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Create a new account" : "I already have an account"}
        </button>
      </section>
    </main>
  );
}

export default function AuthPage() {
  return <Suspense fallback={<main id="main-content" className="auth-shell"><section className="auth-card"><p className="subtle">Loading…</p></section></main>}><AuthCard /></Suspense>;
}
