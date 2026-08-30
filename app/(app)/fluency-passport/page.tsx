"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { fluencyEligibility } from "@/src/domain/fluency-track";
import { IconCertificate, IconCheck, IconShield } from "@/app/components/nav-icons";

/**
 * FLUENCY PASSPORT — shareable professional credential preview (Part 88).
 * The learner's verified level comes from /api/dashboard only (Part 105).
 * The report ID is a stable pseudonym derived from the learner ID — it is not
 * a secret and reveals nothing. The verification service (/verification) does
 * not exist yet, so the URL pattern is shown as copyable text, never a link.
 * Positioning is honest by design (Part 93): CEFR-aligned evidence, not a
 * government or Cambridge certification.
 */

interface DashboardPayload {
  level?: unknown;
  firstName?: unknown;
}

interface MePayload {
  user?: { learnerId?: unknown; displayName?: unknown } | null;
}

interface ProfilePayload {
  profile?: {
    displayName?: unknown;
    updatedAt?: unknown;
    englishDna?: { generatedAt?: unknown } | null;
  } | null;
}

interface PassportData {
  level: string;
  displayName: string;
  reportId: string;
  assessedAt: string | null;
}

/** FNV-1a, deterministic across sessions — enough for a stable display ID. */
function fnv1a(input: string, seed = 0x811c9dc5): string {
  let hash = seed >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function reportIdFor(learnerId: string): string {
  return `${fnv1a(learnerId)}${fnv1a(learnerId, 0x1b873593)}`.slice(0, 10).toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/* ------------------------------------------------------------------ */
/* Print layout — tokens are read from the live document at click time */
/* so the printed sheet follows the learner's theme with no raw       */
/* colours in the source.                                             */
/* ------------------------------------------------------------------ */

const PRINT_TOKENS = [
  "--bg-primary",
  "--surface-card",
  "--text-primary",
  "--text-secondary",
  "--text-tertiary",
  "--border-subtle",
  "--border-strong",
  "--accent-primary",
  "--accent-strong",
  "--accent-secondary",
  "--accent-text",
  "--accent-soft",
  "--accent-softer",
] as const;

function readTokenValue(token: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value || "transparent";
}

function buildPrintDocument(data: PassportData): string {
  const tokenBlock = PRINT_TOKENS.map((token) => `${token}: ${readTokenValue(token)};`).join(" ");
  const verificationPath = `/verification?id=${data.reportId}`;
  const issued = formatDate(new Date().toISOString());

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>English Wizard — Fluency Passport — ${data.reportId}</title>
<style>
  :root { ${tokenBlock} }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px 16px; background: var(--bg-primary); color: var(--text-primary); font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; display: flex; justify-content: center; }
  .sheet { width: 100%; max-width: 680px; background: var(--surface-card); border: 1px solid var(--border-strong); border-radius: 14px; overflow: hidden; }
  .band { height: 8px; background: linear-gradient(90deg, var(--accent-strong), var(--accent-primary), var(--accent-secondary)); }
  .inner { padding: 34px 42px 28px; text-align: center; }
  .brand { font-size: 12px; letter-spacing: .18em; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; }
  .title { margin: 18px 0 4px; font-size: 15px; letter-spacing: .34em; font-weight: 800; color: var(--accent-text); text-transform: uppercase; }
  .name { margin: 10px 0 0; font-family: Georgia, "Times New Roman", serif; font-size: 34px; font-weight: 600; }
  .fields { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px 22px; margin: 26px 0; padding: 20px 0; border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle); text-align: left; }
  .field dt { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-tertiary); font-weight: 800; }
  .field dd { margin: 5px 0 0; font-size: 17px; font-weight: 700; }
  .field .level { font-family: Georgia, "Times New Roman", serif; font-size: 26px; color: var(--accent-primary); }
  .field code { font-family: "SFMono-Regular", Menlo, Consolas, monospace; font-size: 14px; letter-spacing: .06em; }
  .verify { margin: 0 0 20px; padding: 12px 14px; border: 1px dashed var(--border-strong); border-radius: 9px; background: var(--accent-softer); font-size: 12px; color: var(--text-secondary); text-align: left; }
  .verify strong { display: block; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--text-tertiary); margin-bottom: 5px; }
  .verify code { font-family: "SFMono-Regular", Menlo, Consolas, monospace; font-size: 12.5px; color: var(--text-primary); word-break: break-all; }
  .disclaimer { margin: 0; font-size: 11px; line-height: 1.6; color: var(--text-tertiary); }
  .foot { margin-top: 22px; font-size: 10.5px; color: var(--text-tertiary); letter-spacing: .04em; }
  @page { margin: 16mm; }
  @media print { body { padding: 0; background: var(--surface-card); } .sheet { border: 1px solid var(--border-subtle); box-shadow: none; } }
</style>
</head>
<body>
  <main class="sheet">
    <div class="band"></div>
    <div class="inner">
      <p class="brand">English Wizard</p>
      <h1 class="title">Fluency Passport</h1>
      <p class="name">${data.displayName}</p>
      <dl class="fields">
        <div class="field"><dt>Verified level</dt><dd class="level">${data.level}</dd></div>
        <div class="field"><dt>Last assessment</dt><dd>${data.assessedAt ? formatDate(data.assessedAt) : "Not yet recorded"}</dd></div>
        <div class="field"><dt>Report ID</dt><dd><code>${data.reportId}</code></dd></div>
        <div class="field"><dt>Issued</dt><dd>${issued}</dd></div>
      </dl>
      <p class="verify"><strong>Verification</strong><code>${verificationPath}</code></p>
      <p class="disclaimer">CEFR-aligned fluency evidence issued by English Wizard. Not an official government or Cambridge certification.</p>
      <p class="foot">Generated ${issued} · English Wizard Fluency Track</p>
    </div>
  </main>
</body>
</html>`;
}

function openPrintWindow(data: PassportData, autoPrint: boolean): boolean {
  const win = window.open("", "_blank");
  if (!win) return false;
  win.opener = null;
  win.document.open();
  win.document.write(buildPrintDocument(data));
  win.document.close();
  if (autoPrint) {
    win.focus();
    win.setTimeout(() => win.print(), 400);
  }
  return true;
}

/* ------------------------------------------------------------------ */

export default function FluencyPassportPage() {
  const [data, setData] = useState<PassportData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const [autoPrintBlocked, setAutoPrintBlocked] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const [dashRes, meRes, profileRes] = await Promise.all([
        fetch("/api/dashboard", { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" }),
        fetch("/api/profile", { cache: "no-store" }),
      ]);
      if (!dashRes.ok) throw new Error("dashboard-failed");

      const dash = (await dashRes.json()) as DashboardPayload;
      const level = asString(dash.level);
      if (!level) throw new Error("level-missing");

      let learnerId = "";
      let displayName = asString(dash.firstName) ?? "Learner";
      let assessedAt: string | null = null;

      if (meRes.ok) {
        const me = (await meRes.json()) as MePayload;
        learnerId = asString(me.user?.learnerId) ?? "";
        displayName = asString(me.user?.displayName) ?? displayName;
      }
      if (profileRes.ok) {
        const profilePayload = (await profileRes.json()) as ProfilePayload;
        displayName = asString(profilePayload.profile?.displayName) ?? displayName;
        assessedAt = asString(profilePayload.profile?.englishDna?.generatedAt)
          ?? asString(profilePayload.profile?.updatedAt);
      }

      setData({
        level,
        displayName,
        reportId: learnerId ? reportIdFor(learnerId) : "PENDING0000",
        assessedAt,
      });
    } catch {
      setData(null);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) return load(); });
    return () => {
      cancelled = true;
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
    };
  }, [load]);

  const eligibility = useMemo(() => fluencyEligibility(data?.level ?? ""), [data?.level]);
  const gateActive = data !== null && !eligibility.eligible;

  async function copyVerification() {
    if (!data) return;
    const text = `/verification?id=${data.reportId}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copiedTimerRef.current !== null) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function print(autoPrint: boolean) {
    if (!data) return;
    setPrintError(null);
    setAutoPrintBlocked(false);
    const opened = openPrintWindow(data, autoPrint);
    if (!opened) {
      setPrintError("Your browser blocked the pop-up. Allow pop-ups for this site, then press the button again.");
      return;
    }
    if (autoPrint) setAutoPrintBlocked(true);
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Evidence · Fluency Passport"
        title="Fluency Passport"
        purpose="A shareable record of your verified fluency level — evidence you can show an employer, a university or yourself. Honest banding, no theatre."
        action="Continue the Fluency Track"
        actionHref="/fluency-track"
      />

      {loadError && (
        <div className="state-card error" role="alert">
          <strong>Your passport could not be loaded.</strong> It is drawn from your verified level, so we need that first. Check your connection and try again.
          <div style={{ marginTop: 10 }}>
            <button className="button secondary" onClick={() => void load()}>Try again</button>
          </div>
        </div>
      )}

      {!data && !loadError && (
        <section className="panel" aria-hidden="true">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: "70%" }} />
          <div className="skeleton" style={{ height: 220, marginTop: 14 }} />
          <span className="sr-only">Loading your Fluency Passport…</span>
        </section>
      )}

      {data && gateActive && (
        <div className="state-card info" role="status">
          <strong>Your Fluency Passport is not issued yet.</strong> It is granted once you complete fluency checkpoints on the Fluency Track — and the track opens at B1.
          <p className="empty" style={{ marginTop: 8, marginBottom: 0 }}>
            {eligibility.reason} Keep training in General English; the passport appears here the moment your first checkpoint is banded.
          </p>
          <div style={{ marginTop: 12 }}>
            <Link className="button" href="/general-english">Continue in General English</Link>
          </div>
        </div>
      )}

      {data && !gateActive && (
        <>
          <section className="fp-credential" aria-label="Fluency Passport credential">
            <div className="fp-inner">
              <p className="fp-brand">
                <IconCertificate size={17} />
                English Wizard
              </p>
              <h2 className="fp-title">Fluency Passport</h2>
              <p className="fp-name">{data.displayName}</p>

              <dl className="fp-fields">
                <div className="fp-field">
                  <dt>Verified level</dt>
                  <dd className="fp-level">{data.level}</dd>
                </div>
                <div className="fp-field">
                  <dt>Last assessment</dt>
                  <dd>{data.assessedAt ? formatDate(data.assessedAt) : "Not yet recorded"}</dd>
                </div>
                <div className="fp-field">
                  <dt>Report ID</dt>
                  <dd><code>{data.reportId}</code></dd>
                </div>
                <div className="fp-field">
                  <dt>Issued</dt>
                  <dd>{formatDate(new Date().toISOString())}</dd>
                </div>
              </dl>

              <div className="fp-verify">
                <span className="fp-verify-label">
                  <IconShield size={14} />
                  Verification
                </span>
                <code>/verification?id={data.reportId}</code>
                <button className="button secondary fp-copy" type="button" onClick={() => void copyVerification()}>
                  {copied ? <><IconCheck size={14} /> Copied</> : "Copy link"}
                </button>
              </div>

              <p className="fp-disclaimer">
                CEFR-aligned fluency evidence issued by English Wizard. Not an official government or Cambridge certification.
              </p>
            </div>
          </section>

          {autoPrintBlocked && (
            <p className="empty" style={{ margin: 0, textAlign: "center" }} role="status">
              The passport has opened in a new tab. If the print dialogue did not appear, press Ctrl+P (Cmd+P on Mac) there and choose “Save as PDF”.
            </p>
          )}
          {printError && (
            <div className="state-card error" role="alert" style={{ marginBottom: 0 }}>{printError}</div>
          )}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="button" type="button" onClick={() => print(true)}>Download PDF</button>
            <button className="button secondary" type="button" onClick={() => print(false)}>Preview</button>
          </div>

          <section className="panel" aria-label="About this credential" style={{ maxWidth: 660, margin: "0 auto", width: "100%" }}>
            <div className="panel-title">
              <h3>About this credential</h3>
              <span>What it does and does not claim</span>
            </div>
            <p className="subtle" style={{ margin: "0 0 10px" }}>
              The verified level reflects your placement and the fluency checkpoints you have completed on the Fluency Track.
              Bands are CEFR sub-level ranges, never invented decimals — the same honesty as the checkpoints themselves.
            </p>
            <p className="empty" style={{ margin: 0 }}>
              The verification service is on its way. Until it arrives, keep the Report ID with the document: it is the stable reference
              that future verification will look up. The passport is a record of evidence, not a substitute for an official examination.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
