"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = { displayName: string; nativeLanguage: string; targetLevel: string; dailyMinutes: number };
type Privacy = { analytics: boolean; personalized_ai: boolean; voice_processing: boolean; voice_retention_days: number; share_for_human_review: boolean };
type PlanInfo = { tier: string; name: string; priceLabel: string; highlights: string[] };
type SubscriptionState = {
  effectiveTier: string;
  subscription: { status: string; cancelAtPeriodEnd: boolean } | null;
  plans: PlanInfo[];
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [privacy, setPrivacy] = useState<Privacy>({
    analytics: true,
    personalized_ai: true,
    voice_processing: false,
    voice_retention_days: 7,
    share_for_human_review: false,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [plan, setPlan] = useState<SubscriptionState | null>(null);
  const [planBusy, setPlanBusy] = useState(false);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => { if (payload?.plans) setPlan({ effectiveTier: payload.effectiveTier, subscription: payload.subscription ?? null, plans: payload.plans }); })
      .catch(() => undefined);
  }, []);

  async function changePlan(tier: string) {
    setPlanBusy(true);
    setError("");
    try {
      const response = await fetch("/api/subscription", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "CHANGE_PLAN", tier }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Plan change failed.");
      setPlan((current) => (current ? { ...current, effectiveTier: payload.effectiveTier } : current));
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "Plan change failed.");
    } finally {
      setPlanBusy(false);
    }
  }

  useEffect(() => {
    Promise.all([fetch("/api/profile"), fetch("/api/privacy")])
      .then(async ([profileResponse, privacyResponse]) => {
        const profilePayload = await profileResponse.json();
        const privacyPayload = await privacyResponse.json();
        if (!profileResponse.ok || !privacyResponse.ok) {
          throw new Error("Unable to load settings.");
        }
        setProfile(profilePayload.profile ?? null);
        if (privacyPayload.preferences) setPrivacy(privacyPayload.preferences);
      })
      .catch(() => setError("Unable to load settings."));
  }, []);

  async function save() {
    setError("");
    const profileResponse = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(profile ?? {}),
    });
    const privacyResponse = await fetch("/api/privacy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        preferences: {
          ...privacy,
          personalizedAi: privacy.personalized_ai,
          voiceProcessing: privacy.voice_processing,
          voiceRetentionDays: privacy.voice_retention_days,
          shareForHumanReview: privacy.share_for_human_review,
        },
      }),
    });
    if (!profileResponse.ok || !privacyResponse.ok) {
      setError("Some settings could not be saved.");
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function exportData() {
    const response = await fetch("/api/privacy/export");
    if (!response.ok) {
      setError("Unable to export your data.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "english-wizard-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function deleteAccount() {
    if (!window.confirm("This permanently deletes your English Wizard account and learning data. Continue?")) return;
    setDeleting(true);
    setError("");
    const response = await fetch("/api/privacy/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE_MY_ACCOUNT" }),
    });
    if (response.ok) {
      router.push("/");
      return;
    }
    setDeleting(false);
    setError("Account deletion failed.");
  }

  if (!profile) {
    return (
      <main id="main-content" style={{ maxWidth: 700, margin: "0 auto", padding: 48 }}>
        <h1>Settings</h1>
        <p>{error || "Complete onboarding first."}</p>
      </main>
    );
  }

  return (
    <main id="main-content" style={{ maxWidth: 700, margin: "0 auto", padding: 48 }}>
      <p className="eyebrow">Learner settings</p>
      <h1>Shape your learning</h1>

      <section className="panel" style={{ display: "grid", gap: 14 }}>
        <label>Name<input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} /></label>
        <label>Native language<input value={profile.nativeLanguage} onChange={(event) => setProfile({ ...profile, nativeLanguage: event.target.value })} /></label>
        <label>Target level<select value={profile.targetLevel} onChange={(event) => setProfile({ ...profile, targetLevel: event.target.value })}>{["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <option key={level}>{level}</option>)}</select></label>
        <label>Daily minutes<input type="number" min="5" max="180" value={profile.dailyMinutes} onChange={(event) => setProfile({ ...profile, dailyMinutes: Number(event.target.value) })} /></label>
      </section>

      {plan && (
        <section className="panel" style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <h2>Plan</h2>
          <p className="subtle">Current plan: <strong>{plan.effectiveTier}</strong>{plan.subscription?.status === "CANCELLED" ? " (cancels at period end)" : ""}. Changing plans never touches your learning data.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {plan.plans.map((item) => (
              <article className={plan.effectiveTier === item.tier ? "panel" : "panel"} key={item.tier} style={{ margin: 0 }}>
                <strong>{item.name}</strong>
                <p className="subtle">{item.highlights.join(" · ")}</p>
                <button
                  className={plan.effectiveTier === item.tier ? "button secondary" : "button"}
                  disabled={planBusy || plan.effectiveTier === item.tier}
                  onClick={() => changePlan(item.tier)}
                >
                  {plan.effectiveTier === item.tier ? "Current plan" : `Switch to ${item.name}`}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="panel" style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <h2>Privacy</h2>
        <label><input type="checkbox" checked={privacy.analytics} onChange={(event) => setPrivacy({ ...privacy, analytics: event.target.checked })} /> Product analytics</label>
        <label><input type="checkbox" checked={privacy.personalized_ai} onChange={(event) => setPrivacy({ ...privacy, personalized_ai: event.target.checked })} /> Personalized AI teacher</label>
        <label><input type="checkbox" checked={privacy.voice_processing} onChange={(event) => setPrivacy({ ...privacy, voice_processing: event.target.checked })} /> Allow voice processing</label>
        <label>Voice retention days<input type="number" min="0" max="365" value={privacy.voice_retention_days} onChange={(event) => setPrivacy({ ...privacy, voice_retention_days: Number(event.target.value) })} /></label>
        <label><input type="checkbox" checked={privacy.share_for_human_review} onChange={(event) => setPrivacy({ ...privacy, share_for_human_review: event.target.checked })} /> Allow voice samples for human review</label>
        {error && <p role="alert">{error}</p>}
        <button className="button" onClick={save}>{saved ? "Saved ✓" : "Save settings"}</button>
      </section>

      <section className="panel" style={{ display: "grid", gap: 12, marginTop: 18 }}>
        <h2>My data</h2>
        <p className="subtle">Export your learner data or permanently delete your account.</p>
        <button className="button secondary" onClick={exportData}>Export my data</button>
        <button className="button secondary" disabled={deleting} onClick={deleteAccount}>{deleting ? "Deleting…" : "Delete my account"}</button>
      </section>
    </main>
  );
}
