"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCT_NAMES } from "@/src/domain/entitlements";
import { annualSavingPct, formatPrice, pricesForRegion, type RegionCode } from "@/src/domain/pricing";
import { IconUsers, IconCertificate, IconShield, IconFolder, IconCamera } from "@/app/components/nav-icons";

type Profile = { displayName: string; nativeLanguage: string; targetLevel: string; dailyMinutes: number; avatarUrl?: string | null; avatarKind?: string };
type Privacy = { analytics: boolean; personalized_ai: boolean; voice_processing: boolean; voice_retention_days: number; share_for_human_review: boolean };

const ORDER = ["general-english", "business-english", "fluency-track", "ielts", "cambridge", "all-access"];

/** Preset illustrated avatars — SVG data URLs generated on the client. */
const AVATAR_PRESETS: Array<{ emoji: string; from: string; to: string }> = [
  { emoji: "🦉", from: "#4f2fb8", to: "#8a63ff" },
  { emoji: "🧙", from: "#0d1930", to: "#4f2fb8" },
  { emoji: "🚀", from: "#0e7490", to: "#22b8cf" },
  { emoji: "🦁", from: "#e8590c", to: "#f7b955" },
  { emoji: "🌟", from: "#b02a37", to: "#e8590c" },
  { emoji: "🐬", from: "#0b7285", to: "#2f9e44" },
  { emoji: "🦊", from: "#a53b3b", to: "#f6b73c" },
  { emoji: "🧠", from: "#5f3dc4", to: "#e64980" },
];

function presetAvatarUrl(preset: { emoji: string; from: string; to: string }): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${preset.from}"/><stop offset="1" stop-color="${preset.to}"/></linearGradient></defs><rect width="64" height="64" rx="32" fill="url(#g)"/><text x="32" y="35" font-size="32" text-anchor="middle" dominant-baseline="central">${preset.emoji}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

/** Downscale any uploaded image to a 256×256 cover-cropped JPEG data URL. */
async function fileToAvatarDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 256, 256);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.86);
}

function initialsFor(name: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "EW";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return trimmed.slice(0, 2).toUpperCase();
}

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
  const [plan, setPlan] = useState<{ effectiveTier: string; cancelAtPeriodEnd: boolean } | null>(null);
  const [planBusy, setPlanBusy] = useState(false);
  const [region, setRegion] = useState<RegionCode>("WW");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  // Local avatar state: { url, kind } — "initials" means no picture (monogram).
  const [avatar, setAvatar] = useState<{ url: string | null; kind: string }>({ url: null, kind: "initials" });

  useEffect(() => {
    Promise.all([fetch("/api/profile"), fetch("/api/privacy"), fetch("/api/subscription")])
      .then(async ([profileResponse, privacyResponse, planResponse]) => {
        const profilePayload = await profileResponse.json();
        const privacyPayload = await privacyResponse.json();
        const planPayload = await planResponse.json().catch(() => null);
        if (!profileResponse.ok || !privacyResponse.ok) throw new Error("Unable to load settings.");
        setProfile(profilePayload.profile ?? null);
        if (profilePayload.profile) {
          const p = profilePayload.profile;
          setAvatar({ url: p.avatarKind && p.avatarKind !== "initials" ? p.avatarUrl : null, kind: p.avatarKind ?? "initials" });
        }
        if (privacyPayload.preferences) setPrivacy(privacyPayload.preferences);
        if (planPayload?.effectiveTier) setPlan({ effectiveTier: planPayload.effectiveTier, cancelAtPeriodEnd: Boolean(planPayload.subscription?.cancelAtPeriodEnd) });
      })
      .catch(() => setError("Unable to load settings."));
  }, []);

  async function postProfileAvatar(payload: { url: string | null; kind: string }) {
    setAvatarBusy(true);
    setAvatarError("");
    try {
      const body = payload.kind === "initials" ? { avatar: "RESET" } : { avatar: { url: payload.url, kind: payload.kind } };
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ avatar: body.avatar }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to update your picture.");
      setAvatar(payload);
      // The app shell listens for this to refresh the header avatar instantly.
      window.dispatchEvent(new CustomEvent("ew-avatar-changed"));
    } catch (e) {
      setAvatarError(e instanceof Error ? e.message : "Unable to update your picture.");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onPhotoChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file (PNG, JPEG or WebP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAvatarError("Please choose an image under 8 MB — it is resized automatically.");
      return;
    }
    try {
      const url = await fileToAvatarDataUrl(file);
      await postProfileAvatar({ url, kind: "photo" });
    } catch {
      setAvatarError("That image could not be processed — try another file.");
    }
  }

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
      <main id="main-content" className="dash-main" style={{ maxWidth: 700, margin: "0 auto" }}>
        <div className="state-card">{error || "Complete onboarding first."}</div>
      </main>
    );
  }

  const plans = pricesForRegion(region)
    .slice()
    .sort((a, b) => ORDER.indexOf(a.product) - ORDER.indexOf(b.product));
  const currentPlanName = PRODUCT_NAMES[plan?.effectiveTier as keyof typeof PRODUCT_NAMES] ?? plan?.effectiveTier ?? "Free";

  return (
    <main id="main-content" className="dash-main">
      <div className="settings-wrap">
        {/* Identity hero — the learner, not a logo */}
        <section className="settings-hero" aria-label="Your profile">
          <span className="avatar avatar-preview" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- data-URL profile pictures only */}
            {avatar.url ? <img src={avatar.url} alt="" /> : initialsFor(profile.displayName)}
          </span>
          <div>
            <h1>{profile.displayName}</h1>
            <p className="sh-sub">Learning English · target {profile.targetLevel} · {profile.dailyMinutes} minutes a day</p>
          </div>
          <div className="sh-actions">
            <Link className="button secondary" href="/plan" style={{ background: "rgba(255,255,255,.12)", color: "#fff", borderColor: "rgba(255,255,255,.3)" }}>
              {currentPlanName} plan
            </Link>
          </div>
        </section>

        {/* Profile picture — real photo or illustrated avatar */}
        <section className="settings-card" aria-label="Profile picture">
          <h2><span className="sc-icon"><IconCamera size={16} /></span>Profile picture</h2>
          <p className="sc-sub">Shown next to your name across English Wizard. Upload a real photo or pick an avatar — you can reset to your initials any time.</p>
          <div className="avatar-picker">
            <span className="avatar-preview" aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- data-URL profile pictures only */}
              {avatar.url ? <img src={avatar.url} alt="" /> : initialsFor(profile.displayName)}
            </span>
            <div style={{ display: "grid", gap: 10 }}>
              <label className="button secondary" style={{ textAlign: "center", cursor: avatarBusy ? "wait" : "pointer", maxWidth: 220 }}>
                {avatarBusy ? "Updating…" : "Upload a photo"}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => void onPhotoChosen(e)} disabled={avatarBusy} />
              </label>
              <div className="avatar-options" role="group" aria-label="Choose an avatar">
                {AVATAR_PRESETS.map((preset) => {
                  const url = presetAvatarUrl(preset);
                  return (
                    <button
                      key={preset.emoji}
                      type="button"
                      className={`avatar-option ${avatar.url === url ? "selected" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${preset.from}, ${preset.to})` }}
                      onClick={() => void postProfileAvatar({ url, kind: "avatar" })}
                      disabled={avatarBusy}
                      aria-label={`Avatar ${preset.emoji}`}
                    >
                      {preset.emoji}
                    </button>
                  );
                })}
              </div>
              {avatar.kind !== "initials" && (
                <button type="button" className="link-button" style={{ justifySelf: "start" }} onClick={() => void postProfileAvatar({ url: null, kind: "initials" })} disabled={avatarBusy}>
                  Reset to my initials
                </button>
              )}
            </div>
          </div>
          {avatarError && <p role="alert" className="state-card error" style={{ marginTop: 12, marginBottom: 0 }}>{avatarError}</p>}
        </section>

        {/* Learning preferences */}
        <section className="settings-card" aria-label="Learning preferences">
          <h2><span className="sc-icon"><IconUsers size={16} /></span>Learning preferences</h2>
          <p className="sc-sub">Your name, language and daily rhythm — the plan adapts to these.</p>
          <div className="settings-grid2">
            <label className="field-label">Name
              <input value={profile.displayName} onChange={(event) => setProfile({ ...profile, displayName: event.target.value })} />
            </label>
            <label className="field-label">Native language
              <input value={profile.nativeLanguage} onChange={(event) => setProfile({ ...profile, nativeLanguage: event.target.value })} />
            </label>
            <label className="field-label">Target level
              <select value={profile.targetLevel} onChange={(event) => setProfile({ ...profile, targetLevel: event.target.value })}>
                {["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"].map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
            <label className="field-label">Daily minutes
              <input type="number" min="5" max="180" value={profile.dailyMinutes} onChange={(event) => setProfile({ ...profile, dailyMinutes: Number(event.target.value) })} />
            </label>
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="button" onClick={save}>{saved ? "Saved ✓" : "Save preferences"}</button>
            {error && <span role="alert" style={{ color: "var(--danger)", fontSize: 13 }}>{error}</span>}
          </div>
        </section>

        {/* Plan — the 2.0 catalogue, never legacy tiers */}
        <section className="settings-card" aria-label="Your plan">
          <h2><span className="sc-icon"><IconCertificate size={16} /></span>Plan &amp; subscription</h2>
          <p className="sc-sub">
            Current plan: <strong>{currentPlanName}</strong>
            {plan?.cancelAtPeriodEnd ? " (cancels at period end)" : ""}. One price per product, or All Access for everything —
            a plan change never touches your learning data.{" "}
            <Link href="/plan">Manage pause, cancel and billing →</Link>
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            <div role="group" aria-label="Billing period" style={{ display: "inline-flex", gap: 8 }}>
              {(["monthly", "yearly"] as const).map((p) => (
                <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)}
                  className={period === p ? "button" : "button secondary"} style={{ padding: "6px 13px", fontSize: 12.5, textTransform: "capitalize" }}>
                  {p}
                </button>
              ))}
            </div>
            <div role="group" aria-label="Region" style={{ display: "inline-flex", gap: 8 }}>
              {(["WW", "EG"] as RegionCode[]).map((code) => (
                <button key={code} type="button" aria-pressed={region === code} onClick={() => setRegion(code)}
                  className={region === code ? "button" : "button secondary"} style={{ padding: "6px 13px", fontSize: 12.5 }}>
                  {code === "WW" ? "Worldwide (USD)" : "Egypt (EGP)"}
                </button>
              ))}
            </div>
          </div>
          <div className="plan-mini-grid">
            {plans.map((entry) => {
              const isCurrent = plan?.effectiveTier === entry.product;
              const yearly = period === "yearly";
              return (
                <article key={entry.product} className={`plan-mini ${isCurrent ? "current" : ""}`}>
                  {isCurrent && <span className="plan-badge">Current</span>}
                  <strong>{entry.name}</strong>
                  <div className="pm-price">
                    {formatPrice(yearly ? entry.annual : entry.monthly, entry.currency)}
                    <small> / {yearly ? "year" : "month"}</small>
                  </div>
                  <span className="pm-note">{yearly ? `Save ${annualSavingPct(entry)}% vs monthly` : `or ${formatPrice(entry.annual, entry.currency)}/year — save ${annualSavingPct(entry)}%`}</span>
                  <button
                    className={isCurrent ? "button secondary" : "button"}
                    disabled={planBusy || isCurrent}
                    onClick={() => changePlan(entry.product)}
                    style={{ padding: "8px 10px", fontSize: 12.5 }}
                  >
                    {isCurrent ? "Your plan" : `Choose ${entry.name}`}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="subtle" style={{ margin: "12px 0 0", fontSize: 12 }}>
            Every account includes LevelCheck placement, the core curriculum, daily plan and progress insights — plus 5 AI sessions and 2 speaking checks daily, free.
          </p>
        </section>

        {/* Privacy */}
        <section className="settings-card" aria-label="Privacy">
          <h2><span className="sc-icon"><IconShield size={16} /></span>Privacy</h2>
          <p className="sc-sub">You decide what English Wizard learns about you and keeps. Everything here takes effect immediately.</p>
          <div>
            <div className="switch-row">
              <div className="sw-copy"><strong>Product analytics</strong><span>Anonymous usage patterns that help improve the platform.</span></div>
              <span className="switch"><input type="checkbox" checked={privacy.analytics} onChange={(event) => setPrivacy({ ...privacy, analytics: event.target.checked })} aria-label="Product analytics" /><span className="knob" /></span>
            </div>
            <div className="switch-row">
              <div className="sw-copy"><strong>Personalised AI tutor</strong><span>Let the tutor use your level, mistakes and goals to tailor explanations.</span></div>
              <span className="switch"><input type="checkbox" checked={privacy.personalized_ai} onChange={(event) => setPrivacy({ ...privacy, personalized_ai: event.target.checked })} aria-label="Personalised AI tutor" /><span className="knob" /></span>
            </div>
            <div className="switch-row">
              <div className="sw-copy"><strong>Allow voice processing</strong><span>Speaking checks and pronunciation feedback require voice analysis.</span></div>
              <span className="switch"><input type="checkbox" checked={privacy.voice_processing} onChange={(event) => setPrivacy({ ...privacy, voice_processing: event.target.checked })} aria-label="Allow voice processing" /><span className="knob" /></span>
            </div>
            <div className="switch-row">
              <div className="sw-copy"><strong>Voice retention</strong><span>Days to keep voice samples before automatic deletion.</span></div>
              <label className="field-label" style={{ width: 110 }}>
                <input type="number" min="0" max="365" value={privacy.voice_retention_days} onChange={(event) => setPrivacy({ ...privacy, voice_retention_days: Number(event.target.value) })} aria-label="Voice retention days" />
              </label>
            </div>
            <div className="switch-row">
              <div className="sw-copy"><strong>Human review</strong><span>Allow voice samples to be reviewed by a human for quality assurance.</span></div>
              <span className="switch"><input type="checkbox" checked={privacy.share_for_human_review} onChange={(event) => setPrivacy({ ...privacy, share_for_human_review: event.target.checked })} aria-label="Allow voice samples for human review" /><span className="knob" /></span>
            </div>
          </div>
        </section>

        {/* My data */}
        <section className="settings-card" aria-label="My data">
          <h2><span className="sc-icon"><IconFolder size={16} /></span>My data</h2>
          <p className="sc-sub">Your learning data is yours. Export it as JSON, or delete your account and every trace of it.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="button secondary" onClick={exportData}>Export my data</button>
            <button className="button secondary" disabled={deleting} onClick={deleteAccount} style={{ color: "var(--danger)", borderColor: "var(--danger-border)" }}>
              {deleting ? "Deleting…" : "Delete my account"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
