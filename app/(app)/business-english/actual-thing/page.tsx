"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import { UpgradePrompt, parseUpgradePayload, type UpgradeInfo } from "@/app/components/upgrade-prompt";
import { track } from "@/app/lib/track";

type Mode = "job" | "email";

interface JobResult {
  languageDemands: string[];
  keyVocabulary: Array<{ term: string; meaning: string }>;
  likelyQuestions: string[];
  interviewTask: string;
  practicePlan: string[];
}

interface EmailIssue {
  type: string;
  before: string;
  after: string;
  why: string;
}

interface EmailResult {
  issues: EmailIssue[];
  improvedEmail: string;
  toneNotes: string[];
  practiceTask: string;
}

const MIN_TEXT = 40;
const MAX_TEXT = 6000;

export default function ActualThingPage() {
  const [mode, setMode] = useState<Mode>("job");
  const [jobText, setJobText] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [emailText, setEmailText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthed, setUnauthed] = useState(false);
  const [upgrade, setUpgrade] = useState<UpgradeInfo | null>(null);
  const [jobResult, setJobResult] = useState<JobResult | null>(null);
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);
  const [planDone, setPlanDone] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    track("actual_thing_opened");
  }, []);

  const text = mode === "job" ? jobText : emailText;
  const ready = text.trim().length >= MIN_TEXT && text.trim().length <= MAX_TEXT && !busy;

  async function submit() {
    setBusy(true);
    setError(null);
    setUpgrade(null);
    setUnauthed(false);
    setJobResult(null);
    setEmailResult(null);
    setPlanDone([]);
    setCopied(false);
    try {
      const body = mode === "job"
        ? { mode: "job", text: jobText.trim(), roleTitle: roleTitle.trim() || undefined }
        : { mode: "email", text: emailText.trim() };
      const res = await fetch("/api/business/actual-thing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 401) {
        setUnauthed(true);
        return;
      }
      const payload = (await res.json()) as Record<string, unknown>;
      if (res.status === 402) {
        setUpgrade(parseUpgradePayload(payload));
        setError(typeof payload.error === "string" ? payload.error : null);
        return;
      }
      if (!res.ok) {
        setError(typeof payload.error === "string" ? payload.error : "The coach could not read that. Please try again.");
        return;
      }
      const result = payload.result as JobResult | EmailResult | undefined;
      if (mode === "job") {
        const job = result as JobResult | undefined;
        if (!job || !Array.isArray(job.languageDemands)) {
          setError("The coach returned something unreadable. Please try again.");
          return;
        }
        setJobResult(job);
        setPlanDone(job.practicePlan.map(() => false));
        track("actual_thing_result", { mode: "job" });
      } else {
        const email = result as EmailResult | undefined;
        if (!email || !Array.isArray(email.issues)) {
          setError("The coach returned something unreadable. Please try again.");
          return;
        }
        setEmailResult(email);
        track("actual_thing_result", { mode: "email" });
      }
    } catch {
      setError("Unable to reach the coach right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyImprovedEmail() {
    if (!emailResult) return;
    try {
      await navigator.clipboard.writeText(emailResult.improvedEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copying was blocked by the browser. Select the email text and copy it manually.");
    }
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Business English · Personalised"
        title="Practise Your Actual Thing"
        purpose="Two engines, one rule: paste the real material — the job description or the email — and train on exactly that. Nothing generic."
        action="Business English overview"
        actionHref="/business-english"
      />

      {/* Mode switch */}
      <div className="at-modes" role="group" aria-label="Choose what you are practising">
        <button type="button" className="at-mode" data-active={mode === "job"} onClick={() => setMode("job")} aria-pressed={mode === "job"}>
          <strong>The job description</strong>
          <span>Paste a real vacancy. Get its language, its likely questions, and a plan to be ready.</span>
        </button>
        <button type="button" className="at-mode" data-active={mode === "email"} onClick={() => setMode("email")} aria-pressed={mode === "email"}>
          <strong>The email</strong>
          <span>Paste a message you need to write or fix. Get it rewritten, with every change explained.</span>
        </button>
      </div>

      {/* Input */}
      <section className="panel" aria-label="Your material">
        {mode === "job" ? (
          <div className="at-form">
            <label className="at-label">
              Paste the job description
              <textarea
                rows={8}
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the full job description here — responsibilities, requirements, the lot."
                aria-describedby="at-length-hint"
              />
            </label>
            <label className="at-label">
              Role title (optional)
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Senior Accountant"
                maxLength={120}
              />
            </label>
          </div>
        ) : (
          <div className="at-form">
            <label className="at-label">
              Paste the email or message you need to write or improve
              <textarea
                rows={8}
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                placeholder="Draft or rough notes are fine — the closer to your real words, the better the coaching."
                aria-describedby="at-length-hint"
              />
            </label>
          </div>
        )}
        <p id="at-length-hint" className="subtle" style={{ margin: "10px 0 0" }}>
          Between {MIN_TEXT} and {MAX_TEXT} characters. Your text is used only for this coaching session.
        </p>
        <button type="button" className="button" onClick={submit} disabled={!ready} style={{ marginTop: 14 }}>
          {busy ? "Reading your material…" : mode === "job" ? "Prepare me for this job" : "Coach this email"}
        </button>
        {text.trim().length > 0 && text.trim().length < MIN_TEXT && (
          <p className="subtle" style={{ margin: "8px 0 0", color: "var(--text-secondary)" }}>
            {MIN_TEXT - text.trim().length} more characters needed — the coach works from real material.
          </p>
        )}
      </section>

      {unauthed && (
        <section className="panel" aria-label="Sign in required">
          <p className="subtle" style={{ margin: 0 }}>
            Sign in first — the coach reads your level so everything it writes fits you.{" "}
            <Link href="/auth">Sign in</Link>
          </p>
        </section>
      )}

      {upgrade && <UpgradePrompt info={upgrade} onClose={() => setUpgrade(null)} />}

      {error && (
        <section className="panel" role="alert">
          <strong>{error}</strong>
        </section>
      )}

      {/* Job mode results */}
      {jobResult && (
        <div style={{ display: "grid", gap: 18 }}>
          <section className="panel" aria-label="Language demands">
            <div className="panel-title"><h3>The language this job demands</h3><span>Read from your description</span></div>
            <ul className="at-list">
              {jobResult.languageDemands.map((demand) => <li key={demand}>{demand}</li>)}
            </ul>
          </section>

          <section className="panel" aria-label="Key vocabulary">
            <div className="panel-title"><h3>Key vocabulary</h3><span>The words this employer expects</span></div>
            <div className="at-vocab">
              {jobResult.keyVocabulary.map((v) => (
                <div key={v.term} className="at-vocab-item">
                  <span className="pill">{v.term}</span>
                  <span className="at-vocab-meaning">{v.meaning}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel" aria-label="Likely interview questions">
            <div className="panel-title"><h3>Questions you should expect</h3><span>Practise answers out loud</span></div>
            <ol className="at-list numbered">
              {jobResult.likelyQuestions.map((q) => <li key={q}>{q}</li>)}
            </ol>
          </section>

          <section className="at-callout" aria-label="Interview task">
            <p className="eyebrow">Your interview task</p>
            <p className="at-callout-body">{jobResult.interviewTask}</p>
            <Link className="button" href="/roleplay">Rehearse it in Role-play</Link>
          </section>

          <section className="panel" aria-label="Practice plan">
            <div className="panel-title"><h3>Practice plan</h3><span>Tick it off as you go</span></div>
            <ul className="at-plan">
              {jobResult.practicePlan.map((step, i) => (
                <li key={step}>
                  <label>
                    <input
                      type="checkbox"
                      checked={planDone[i] ?? false}
                      onChange={() => setPlanDone((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                      aria-label={`Mark step ${i + 1} done`}
                    />
                    <span data-done={planDone[i] ? "true" : undefined}>{step}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {/* Email mode results */}
      {emailResult && (
        <div style={{ display: "grid", gap: 18 }}>
          <section className="panel" aria-label="Line-by-line issues">
            <div className="panel-title"><h3>What changed, line by line</h3><span>Your words, corrected and explained</span></div>
            <div style={{ display: "grid", gap: 14 }}>
              {emailResult.issues.map((issue, i) => (
                <article key={`${issue.type}-${i}`} className="at-issue">
                  <p className="at-issue-type">{issue.type}</p>
                  <div className="at-issue-grid">
                    <blockquote className="at-issue-before">
                      <span className="sr-only">Before:</span>
                      {issue.before}
                    </blockquote>
                    <blockquote className="at-issue-after">
                      <span className="sr-only">After:</span>
                      {issue.after}
                    </blockquote>
                  </div>
                  <p className="at-issue-why"><strong>Why:</strong> {issue.why}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel" aria-label="Improved email">
            <div className="panel-title">
              <h3>The improved email</h3>
              <button type="button" className="button secondary" onClick={copyImprovedEmail}>
                {copied ? "Copied" : "Copy email"}
              </button>
            </div>
            <div className="at-document">
              {emailResult.improvedEmail.split(/\n+/).map((para, i) => para.trim() ? <p key={i}>{para}</p> : null)}
            </div>
          </section>

          <section className="panel" aria-label="Tone notes">
            <div className="panel-title"><h3>Tone notes</h3><span>How it sounds, and why</span></div>
            <ul className="at-list">
              {emailResult.toneNotes.map((note) => <li key={note}>{note}</li>)}
            </ul>
          </section>

          <section className="at-callout" aria-label="Practice task">
            <p className="eyebrow">Your writing task</p>
            <p className="at-callout-body">{emailResult.practiceTask}</p>
            <Link className="button" href="/writing">Do it in the Writing studio</Link>
          </section>
        </div>
      )}
    </main>
  );
}
