"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/app/components/page-header";
import {
  FLUENCY_BANDS,
  FLUENCY_MODULES,
  fluencyEligibility,
  fluencyFeedbackBand,
  modulesForBand,
  type FluencyModule,
  type FluencyStage,
} from "@/src/domain/fluency-track";
import {
  IconBulb,
  IconChat,
  IconCheck,
  IconMic,
  IconShield,
  IconSpark,
  IconTarget,
} from "@/app/components/nav-icons";
import { ProductGate } from "@/app/components/product-gate";

/**
 * THE FLUENCY TRACK — product landing and module runner (Parts 77–88, 107/108).
 * One page, two states: the programme overview (gate, summary, module grid)
 * and an in-page runner that walks explanation → drills → guided role-play →
 * pressure role-play → checkpoint → completion (Part 80).
 * Level is never decided here: it is fetched from /api/dashboard and passed
 * through fluencyEligibility (Part 105 — one source of truth).
 */

type TrackFilter = "ALL" | "BUSINESS" | "LIFE";

interface ModuleProgress {
  stage: FluencyStage;
  drillsDone: number[];
  checkpointBand: string | null;
  checkpointCriteria: number;
  completedAt: string | null;
}

const FRESH_PROGRESS: ModuleProgress = {
  stage: "explanation",
  drillsDone: [],
  checkpointBand: null,
  checkpointCriteria: 0,
  completedAt: null,
};

const STAGES: FluencyStage[] = ["explanation", "drills", "guided", "pressure", "checkpoint"];
const STAGE_LABELS: Record<FluencyStage, string> = {
  explanation: "Explanation",
  drills: "Drills",
  guided: "Guided role-play",
  pressure: "Pressure role-play",
  checkpoint: "Checkpoint",
};

const BAND_DESCRIPTIONS: Record<string, string> = {
  B1: "Foundation — hold your own in everyday exchanges.",
  B2: "Range — handle the unexpected without losing the thread.",
  C1: "Precision — nuance, negotiation and control at speed.",
  C2: "Mastery — perform under pressure with grace.",
};

const TRACK_LABELS: Record<string, string> = {
  BUSINESS: "Business",
  LIFE: "Life",
  DUAL: "Business + Life",
};

const PRESSURE_LABELS: Record<number, string> = {
  1: "Relaxed",
  2: "Brisk",
  3: "Demanding",
};

const STORAGE_PREFIX = "ew-fluency-progress:";

function progressKey(moduleId: string): string {
  return `${STORAGE_PREFIX}${moduleId}`;
}

function readProgress(moduleId: string): ModuleProgress {
  try {
    const raw = window.localStorage.getItem(progressKey(moduleId));
    if (!raw) return { ...FRESH_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<ModuleProgress>;
    return {
      stage: parsed.stage && STAGES.includes(parsed.stage) ? parsed.stage : "explanation",
      drillsDone: Array.isArray(parsed.drillsDone) ? parsed.drillsDone.filter((n) => Number.isInteger(n)) : [],
      checkpointBand: typeof parsed.checkpointBand === "string" ? parsed.checkpointBand : null,
      checkpointCriteria: typeof parsed.checkpointCriteria === "number" && Number.isInteger(parsed.checkpointCriteria) ? parsed.checkpointCriteria : 0,
      completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : null,
    };
  } catch {
    return { ...FRESH_PROGRESS };
  }
}

function readAllProgress(): Record<string, ModuleProgress> {
  const map: Record<string, ModuleProgress> = {};
  for (const entry of FLUENCY_MODULES) map[entry.id] = readProgress(entry.id);
  return map;
}

function writeProgress(moduleId: string, progress: ModuleProgress): void {
  try {
    window.localStorage.setItem(progressKey(moduleId), JSON.stringify(progress));
  } catch {
    /* storage unavailable — the session still works, progress simply will not persist */
  }
}

function isComplete(progress: ModuleProgress | undefined): boolean {
  return Boolean(progress?.checkpointBand);
}

function trackLabel(track: string): string {
  return TRACK_LABELS[track] ?? track;
}

interface DashboardPayload {
  level?: unknown;
}

/* ------------------------------------------------------------------ */
/* Role-play turn engine (shared by guided and pressure role-plays)    */
/* ------------------------------------------------------------------ */

type RoleplayEntry =
  | { kind: "line"; who: "persona" | "you"; text: string }
  | { kind: "direction"; tone: "plain" | "complication"; text: string };

function RoleplayStage({
  module,
  variant,
  onNext,
  nextLabel,
  minTurns,
}: {
  module: FluencyModule;
  variant: "guided" | "pressure";
  onNext: () => void;
  nextLabel: string;
  minTurns: number;
}) {
  const spec = variant === "guided" ? module.guidedRoleplay : module.pressureRoleplay;
  const complication = variant === "pressure" ? module.pressureRoleplay.complication : null;

  const [entries, setEntries] = useState<RoleplayEntry[]>([
    { kind: "line", who: "persona", text: spec.opener },
  ]);
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState(0);
  const [complicationShown, setComplicationShown] = useState(false);
  const [usedTargets, setUsedTargets] = useState<string[]>([]);
  const fallbackIndexRef = useRef(0);
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  function toggleTarget(phrase: string) {
    setUsedTargets((list) => (list.includes(phrase) ? list.filter((p) => p !== phrase) : [...list, phrase]));
  }

  function sendTurn() {
    const text = draft.trim();
    if (!text) return;
    const next: RoleplayEntry[] = [...entries, { kind: "line", who: "you", text }];
    const nextTurns = turns + 1;
    if (complication && !complicationShown && nextTurns >= 2) {
      next.push({ kind: "direction", tone: "complication", text: complication });
      setComplicationShown(true);
    }
    const fallbacks = spec.fallbacks;
    next.push({ kind: "line", who: "persona", text: fallbacks[fallbackIndexRef.current % fallbacks.length] });
    fallbackIndexRef.current += 1;
    setEntries(next);
    setTurns(nextTurns);
    setDraft("");
  }

  const persona = spec.persona;
  const stageAria = variant === "guided" ? STAGE_LABELS.guided : STAGE_LABELS.pressure;

  return (
    <div className="ck-stage">
      <div>
        <p className="ck-stage-label">Scenario</p>
        <p className="subtle" style={{ margin: "8px 0 0" }}>{spec.scenario}</p>
      </div>

      <div>
        <p className="ck-stage-label">Your goal</p>
        <div className="conv-next" style={{ marginTop: 8 }}>
          <IconTarget size={16} />
          <span>{spec.goal}</span>
        </div>
      </div>

      <div>
        <p className="ck-stage-label">Who you are speaking with</p>
        <div className="ft-persona" style={{ marginTop: 8 }}>
          <p className="ft-persona-name" style={{ margin: 0 }}>
            {persona.name}
            <small>{persona.role}</small>
          </p>
          <dl>
            <div>
              <dt>Personality</dt>
              <dd>{persona.personality}</dd>
            </div>
            <div>
              <dt>What they want</dt>
              <dd>{persona.objective}</dd>
            </div>
            <div>
              <dt>Tone</dt>
              <dd>{persona.tone}</dd>
            </div>
            <div>
              <dt>Pressure</dt>
              <dd>{PRESSURE_LABELS[persona.pressure] ?? "Brisk"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {variant === "guided" && (
        <div>
          <p className="ck-stage-label">Supports you can use</p>
          <ul className="ft-objectives" style={{ marginTop: 8 }}>
            {module.guidedRoleplay.supports.map((support) => (
              <li key={support}>
                <IconBulb size={14} />
                <span>{support}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {variant === "pressure" && (
        <p className="empty" style={{ margin: 0 }}>
          Supports are hidden at pressure level. Speak from what you already own — that is the point of this stage.
        </p>
      )}

      <div>
        <p className="ck-stage-label">The conversation</p>
        <div className="ft-transcript" ref={transcriptRef} role="log" aria-label={`${stageAria} conversation`} style={{ marginTop: 8 }}>
          {entries.map((entry, index) =>
            entry.kind === "line" ? (
              <p
                key={index}
                className="ft-line"
                data-speaker={entry.who === "persona" ? "b" : "you"}
                style={{ margin: 0 }}
              >
                <span className="ft-who">{entry.who === "persona" ? persona.name : "You"}</span>
                {entry.text}
              </p>
            ) : (
              <p key={index} className="ft-direction" data-kind={entry.tone} style={{ margin: 0 }}>
                <strong>The complication: </strong>
                {entry.text}
              </p>
            ),
          )}
        </div>
      </div>

      <div>
        <label className="f-label" htmlFor={`ft-turn-${variant}`} style={{ display: "block", marginBottom: 6 }}>
          Your line — write what you would actually say aloud, then send it
        </label>
        <textarea
          id={`ft-turn-${variant}`}
          rows={3}
          value={draft}
          placeholder="Say your line as if the person were in front of you…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") sendTurn();
          }}
          style={{ width: "100%" }}
        />
        <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button className="button" type="button" disabled={!draft.trim()} onClick={sendTurn}>
            Send your line
          </button>
          <button className="button secondary" type="button" disabled={turns < minTurns} onClick={onNext}>
            {nextLabel}
          </button>
          <span className="empty">
            {turns === 0
              ? "The other person has opened — answer in your own words."
              : `${turns} ${turns === 1 ? "turn" : "turns"} played.`}
          </span>
        </div>
        {variant === "pressure" && (
          <p className="empty" style={{ marginTop: 8, marginBottom: 0 }}>
            The complication arrives mid-conversation. Keep going even when the ground shifts.
          </p>
        )}
      </div>

      <div>
        <p className="ck-stage-label">Target phrases</p>
        <p className="empty" style={{ margin: "6px 0 10px" }}>
          Tap a phrase once you have used it in the conversation — honest self-checking is itself the skill.
        </p>
        <div className="filters" style={{ margin: 0 }} role="group" aria-label="Target phrases you have used">
          {spec.targetPhrases.map((phrase) => (
            <button
              key={phrase}
              type="button"
              className="pill ft-target"
              data-used={usedTargets.includes(phrase)}
              aria-pressed={usedTargets.includes(phrase)}
              onClick={() => toggleTarget(phrase)}
            >
              {phrase}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Checkpoint stage — optional recorder + honest self-checked criteria */
/* ------------------------------------------------------------------ */

function CheckpointStage({ module, onSubmit }: { module: FluencyModule; onSubmit: (met: number) => void }) {
  const [checked, setChecked] = useState<number[]>([]);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(typeof reader.result === "string" ? reader.result : null);
        reader.readAsDataURL(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setMicError("The microphone could not be started. Allow microphone access in your browser, then record again — or complete the checkpoint without a recording.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  function toggle(index: number) {
    setChecked((list) => (list.includes(index) ? list.filter((i) => i !== index) : [...list, index]));
  }

  const total = module.checkpoint.criteria.length;

  return (
    <div className="ck-stage">
      <div>
        <p className="ck-stage-label">The task</p>
        <div className="conv-next" style={{ marginTop: 8 }}>
          <IconTarget size={16} />
          <span>{module.checkpoint.task}</span>
        </div>
      </div>

      <div>
        <p className="ck-stage-label">Record your attempt (optional)</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
          {!recording ? (
            <button className="button secondary" type="button" onClick={() => void startRecording()}>
              <IconMic size={15} /> Record my attempt
            </button>
          ) : (
            <button className="button recording" type="button" onClick={stopRecording} aria-label="Stop recording">
              <IconMic size={15} /> Stop recording
            </button>
          )}
          {previewUrl && (
            <button className="button ghost" type="button" onClick={() => setPreviewUrl(null)}>Discard recording</button>
          )}
        </div>
        {recording && <p className="empty" style={{ marginTop: 10, marginBottom: 0 }} role="status">Recording… complete the task at your natural pace, then stop.</p>}
        {previewUrl && <audio controls src={previewUrl} aria-label="Your checkpoint recording" style={{ width: "100%", maxWidth: 420, marginTop: 10 }} />}
        {micError && <div className="state-card error" style={{ marginTop: 10 }} role="alert">{micError}</div>}
        <p className="empty" style={{ marginTop: 10, marginBottom: 0 }}>
          The recording stays in this tab only — nothing is uploaded. Listen back once, then judge yourself against the criteria below.
        </p>
      </div>

      <div>
        <p className="ck-stage-label">Self-check ({checked.length}/{total})</p>
        <ul className="ck-rubric" style={{ marginTop: 8 }}>
          {module.checkpoint.criteria.map((criterion, index) => (
            <li key={criterion}>
              <label>
                <input
                  type="checkbox"
                  checked={checked.includes(index)}
                  onChange={() => toggle(index)}
                  aria-label={criterion}
                />
                <span>
                  <strong>{criterion}</strong>
                </span>
              </label>
            </li>
          ))}
        </ul>
        <p className="empty" style={{ marginTop: 8, marginBottom: 0, display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ flex: "none", marginTop: 3, color: "var(--accent-text)" }}><IconShield size={13} /></span>
          <span>Tick only what you genuinely met. Honest self-assessment is what keeps the band trustworthy.</span>
        </p>
      </div>

      <div>
        <button className="button" type="button" onClick={() => onSubmit(checked.length)}>
          Submit checkpoint
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Module runner                                                       */
/* ------------------------------------------------------------------ */

function ModuleRunner({
  module,
  initial,
  onProgress,
  onExit,
  onOpenModule,
  nextModuleId,
}: {
  module: FluencyModule;
  initial: ModuleProgress;
  onProgress: (moduleId: string, progress: ModuleProgress) => void;
  onExit: () => void;
  onOpenModule: (moduleId: string) => void;
  nextModuleId: string | null;
}) {
  const [progress, setProgress] = useState<ModuleProgress>(() => ({ ...FRESH_PROGRESS, ...initial }));
  const [maxReached, setMaxReached] = useState(() => Math.max(0, STAGES.indexOf(initial.stage)));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const persist = useCallback(
    (patch: Partial<ModuleProgress>) => {
      const next = { ...progress, ...patch };
      setProgress(next);
      onProgress(module.id, next);
    },
    [progress, module.id, onProgress],
  );

  const gotoStage = useCallback(
    (stage: FluencyStage) => {
      persist({ stage });
      setMaxReached((m) => Math.max(m, STAGES.indexOf(stage)));
      window.scrollTo({ top: 0 });
    },
    [persist],
  );

  function toggleDrill(index: number) {
    const next = progress.drillsDone.includes(index)
      ? progress.drillsDone.filter((i) => i !== index)
      : [...progress.drillsDone, index];
    persist({ drillsDone: next });
  }

  function submitCheckpoint(met: number) {
    persist({
      checkpointBand: fluencyFeedbackBand(module, met, module.checkpoint.criteria.length),
      checkpointCriteria: met,
      completedAt: new Date().toISOString(),
    });
    window.scrollTo({ top: 0 });
  }

  function rerunCheckpoint() {
    persist({ checkpointBand: null, checkpointCriteria: 0, completedAt: null });
  }

  const completed = Boolean(progress.checkpointBand);
  const drillsTotal = module.drills.length;
  const drillsDone = progress.drillsDone.filter((i) => i >= 0 && i < drillsTotal).length;

  return (
    <section aria-label={`Module ${module.number}: ${module.title}`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <p className="eyebrow">Module {module.number} of {FLUENCY_MODULES.length} · {module.band}</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, margin: "6px 0 4px", fontSize: "clamp(22px, 2.4vw, 30px)" }}>{module.title}</h2>
          <p className="subtle" style={{ margin: 0 }}>{module.purpose}</p>
        </div>
        <button className="button ghost" type="button" onClick={onExit}>Back to modules</button>
      </div>

      <div className="practice-steps" role="group" aria-label="Module stages" style={{ marginBottom: 16 }}>
        {STAGES.map((stage, index) => (
          <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="step"
              data-done={index < maxReached || (stage === "checkpoint" && completed)}
              data-on={stage === progress.stage}
              onClick={() => { if (index <= maxReached) gotoStage(stage); }}
              style={{ cursor: index <= maxReached ? "pointer" : "default" }}
              aria-current={stage === progress.stage ? "step" : undefined}
            >
              {STAGE_LABELS[stage]}
            </button>
            {index < STAGES.length - 1 && <span className="step-sep" aria-hidden="true">→</span>}
          </span>
        ))}
      </div>

      {progress.stage === "explanation" && (
        <section className="panel" aria-label="Explanation">
          <div className="ck-stage">
            <div>
              <p className="ck-stage-label">What you will be able to do</p>
              <ul className="ft-objectives" style={{ marginTop: 8 }}>
                {module.objectives.map((objective) => (
                  <li key={objective}>
                    <IconCheck size={14} />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="ck-stage-label">Key idea</p>
              <p className="ft-key-idea" style={{ marginTop: 8 }}>{module.explanation.keyIdea}</p>
            </div>
            <div>
              <p className="ck-stage-label">Principles to steal</p>
              <ul className="ft-objectives" style={{ marginTop: 8 }}>
                {module.explanation.principles.map((principle) => (
                  <li key={principle}>
                    <IconSpark size={14} />
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="ck-stage-label">Model dialogue — listen with your eyes first</p>
              <div className="ft-dialogue" style={{ marginTop: 8 }}>
                {module.explanation.modelDialogue.map((line, index) => (
                  <p key={`${line.speaker}-${index}`} className="ft-line" data-speaker={line.speaker === "A" ? "a" : "b"} style={{ margin: 0 }}>
                    <span className="ft-who">Speaker {line.speaker}</span>
                    {line.line}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <button className="button" type="button" onClick={() => gotoStage("drills")}>Begin the drills</button>
            </div>
          </div>
        </section>
      )}

      {progress.stage === "drills" && (
        <section className="panel" aria-label="Drills">
          <div className="panel-title">
            <h3>Production drills — answer aloud before you mark</h3>
            <span>{drillsDone} of {drillsTotal} practised</span>
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            {module.drills.map((drill, index) => {
              const done = progress.drillsDone.includes(index);
              return (
                <article key={drill.prompt} className="ft-drill" data-done={done}>
                  <p className="ft-drill-prompt">{drill.prompt}</p>
                  <div className="filters" style={{ margin: 0 }} aria-label="Useful language">
                    <span className="f-label">Useful language</span>
                    {drill.usefulLanguage.map((phrase) => (
                      <span key={phrase} className="chip" style={{ margin: 0 }}>{phrase}</span>
                    ))}
                  </div>
                  <div className="ft-drill-foot">
                    <button
                      className={done ? "button" : "button secondary"}
                      type="button"
                      onClick={() => toggleDrill(index)}
                      aria-pressed={done}
                    >
                      <IconCheck size={14} /> {done ? "Practised" : "Mark practised"}
                    </button>
                    <span className="empty">Say it aloud, twice, before marking — the toggle is a promise to yourself.</span>
                  </div>
                </article>
              );
            })}
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="button" type="button" disabled={drillsDone < drillsTotal} onClick={() => gotoStage("guided")}>
              Continue to the guided role-play
            </button>
            {drillsDone < drillsTotal && (
              <span className="empty">Mark every drill practised to unlock the role-play — speaking each one aloud is the whole exercise.</span>
            )}
          </div>
        </section>
      )}

      {progress.stage === "guided" && (
        <section className="panel" aria-label="Guided role-play">
          <div className="panel-title">
            <h3>Guided role-play — supports on</h3>
            <span>Pressure level: {PRESSURE_LABELS[module.guidedRoleplay.persona.pressure] ?? "Relaxed"}</span>
          </div>
          <RoleplayStage
            module={module}
            variant="guided"
            minTurns={1}
            nextLabel="Continue to the pressure role-play"
            onNext={() => gotoStage("pressure")}
          />
        </section>
      )}

      {progress.stage === "pressure" && (
        <section className="panel" aria-label="Pressure role-play">
          <div className="panel-title">
            <h3>Pressure role-play — supports off</h3>
            <span>Pressure level: {PRESSURE_LABELS[module.pressureRoleplay.persona.pressure] ?? "Demanding"}</span>
          </div>
          <RoleplayStage
            module={module}
            variant="pressure"
            minTurns={2}
            nextLabel="Continue to the checkpoint"
            onNext={() => gotoStage("checkpoint")}
          />
        </section>
      )}

      {progress.stage === "checkpoint" && !completed && (
        <section className="panel" aria-label="Checkpoint">
          <div className="panel-title">
            <h3>Checkpoint</h3>
            <span>Self-checked, honestly banded</span>
          </div>
          <CheckpointStage module={module} onSubmit={submitCheckpoint} />
        </section>
      )}

      {progress.stage === "checkpoint" && completed && (
        <section className="panel" aria-label="Module complete" role="status">
          <div className="ck-stage">
            <div className="result-box" style={{ margin: 0 }}>
              <p className="eyebrow" style={{ marginBottom: 6 }}>Checkpoint complete</p>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3vw, 36px)", fontWeight: 700 }}>
                Honest band: {progress.checkpointBand}
              </p>
              <p style={{ margin: "8px 0 0" }}>
                You met {progress.checkpointCriteria} of {module.checkpoint.criteria.length} criteria
                {progress.completedAt ? ` on ${new Date(progress.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}` : ""}.
                This is the CEFR sub-level range your self-checked performance supports — no invented decimals.
                Re-run the checkpoint whenever you want a fresher picture.
              </p>
              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="button secondary" type="button" onClick={rerunCheckpoint}>Re-run this checkpoint</button>
              </div>
            </div>

            <div className="conv-next">
              <IconChat size={16} />
              <span><strong>Conversation Gym tie-in: </strong>{module.gymTieIn}</span>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="button" href="/conversation">Keep it warm in the Conversation Gym</Link>
              {nextModuleId && (
                <button className="button secondary" type="button" onClick={() => onOpenModule(nextModuleId)}>
                  Next module
                </button>
              )}
              <button className="button ghost" type="button" onClick={onExit}>Back to modules</button>
            </div>
          </div>
        </section>
      )}

      {!completed && (
        <p className="empty" style={{ marginTop: 12 }}>
          Progress in this module is saved on this device as you go.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

function FluencyTrackPageContent() {
  const [level, setLevel] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [trackFilter, setTrackFilter] = useState<TrackFilter>("ALL");
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, ModuleProgress>>({});

  const loadDashboard = useCallback(async () => {
    setLoadError(false);
    try {
      const r = await fetch("/api/dashboard", { cache: "no-store" });
      if (!r.ok) throw new Error("load-failed");
      const payload = (await r.json()) as DashboardPayload;
      if (typeof payload.level !== "string") throw new Error("bad-payload");
      setLevel(payload.level);
    } catch {
      setLevel(null);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) return loadDashboard(); });
    return () => { cancelled = true; };
  }, [loadDashboard]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(() => { if (!cancelled) setProgressMap(readAllProgress()); });
    return () => { cancelled = true; };
  }, []);

  const eligibility = useMemo(() => fluencyEligibility(level ?? ""), [level]);
  const gateActive = level !== null && !eligibility.eligible;

  const handleProgress = useCallback((moduleId: string, progress: ModuleProgress) => {
    setProgressMap((prev) => ({ ...prev, [moduleId]: progress }));
    writeProgress(moduleId, progress);
  }, []);

  const openModule = useCallback((moduleId: string) => {
    setActiveModuleId(moduleId);
    window.scrollTo({ top: 0 });
  }, []);

  const activeModule = activeModuleId ? FLUENCY_MODULES.find((m) => m.id === activeModuleId) ?? null : null;

  const nextRecommended = useMemo(
    () => FLUENCY_MODULES.find((m) => !isComplete(progressMap[m.id])) ?? null,
    [progressMap],
  );

  const completedTotal = FLUENCY_MODULES.filter((m) => isComplete(progressMap[m.id])).length;

  const visibleByBand = useMemo(() => {
    return FLUENCY_BANDS.map((band) => ({
      band,
      modules: modulesForBand(band).filter((m) => {
        if (trackFilter === "ALL") return true;
        return m.track === trackFilter || m.track === "DUAL";
      }),
    })).filter((group) => group.modules.length > 0);
  }, [trackFilter]);

  /* ---------------- loading ---------------- */
  if (level === null && !loadError) {
    return (
      <main id="main-content" className="dash-main">
        <PageHeader
          eyebrow="Products · Fluency Track"
          title="The Fluency Track"
          purpose="A spoken-fluency programme built on conversation, role-play and spontaneity — sixteen signature modules from B1 to C2."
        />
        <section className="panel" aria-hidden="true">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: "80%" }} />
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          <div className="skeleton" style={{ height: 120, marginTop: 14 }} />
          <span className="sr-only">Loading the Fluency Track…</span>
        </section>
      </main>
    );
  }

  /* ---------------- error ---------------- */
  if (loadError) {
    return (
      <main id="main-content" className="dash-main">
        <PageHeader
          eyebrow="Products · Fluency Track"
          title="The Fluency Track"
          purpose="A spoken-fluency programme built on conversation, role-play and spontaneity — sixteen signature modules from B1 to C2."
        />
        <div className="state-card error" role="alert">
          <strong>The Fluency Track could not be loaded.</strong> We could not confirm your level, and the track opens through it. Check your connection and try again.
          <div style={{ marginTop: 10 }}>
            <button className="button secondary" onClick={() => void loadDashboard()}>Try again</button>
          </div>
        </div>
      </main>
    );
  }

  /* ---------------- entry gate (Part 78) ---------------- */
  if (gateActive) {
    const knownLevels = ["Pre-A1", "A1", "A2", "B1", "B2", "C1", "C2"];
    const notAssessed = !knownLevels.includes(level ?? "");
    return (
      <main id="main-content" className="dash-main">
        <PageHeader
          eyebrow="Products · Fluency Track"
          title="The Fluency Track"
          purpose="A spoken-fluency programme built on conversation, role-play and spontaneity — sixteen signature modules from B1 to C2."
          action="General English"
          actionHref="/general-english"
        />
        <section className="panel" aria-label="Entry rule">
          <p className="eyebrow">Entry rule</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, margin: "8px 0 10px", fontSize: "clamp(21px, 2.2vw, 27px)" }}>
            The Fluency Track opens at B1
          </h2>
          <p className="subtle" style={{ margin: "0 0 14px", maxWidth: 640 }}>
            {notAssessed
              ? "The Fluency Track starts at B1. Finish your placement first and the door opens automatically."
              : eligibility.reason}
          </p>
          <div className="stat-strip" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", marginBottom: 18 }} aria-label="What the track builds">
            <div className="stat-tile"><strong>Spontaneity</strong><span>Answer before you are ready — and stay standing.</span></div>
            <div className="stat-tile"><strong>Role-play</strong><span>Real people, real pressure — guided first, then on your own.</span></div>
            <div className="stat-tile"><strong>Confidence</strong><span>Honest checkpoints that prove progress, not points.</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Link className="button" href="/general-english">Build towards B1 in General English</Link>
            <span className="pill">Your current level: {level}</span>
          </div>
          <p className="empty" style={{ marginTop: 12, marginBottom: 0 }}>
            The rule exists so the track stays spoken from minute one: everything assumes you can already keep a conversation standing.
          </p>
        </section>
      </main>
    );
  }

  /* ---------------- programme ---------------- */
  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Products · Fluency Track"
        title="The Fluency Track"
        purpose="Sixteen signature modules that build spoken fluency — explanation, drills, guided role-play, pressure role-play and an honest checkpoint in each. Choose your track and start where you are."
        action="Start where you are"
        actionHref="#modules"
      />

      {activeModule ? (
        <ModuleRunner
          key={activeModule.id}
          module={activeModule}
          initial={progressMap[activeModule.id] ?? FRESH_PROGRESS}
          onProgress={handleProgress}
          onExit={() => setActiveModuleId(null)}
          onOpenModule={openModule}
          nextModuleId={nextRecommended && nextRecommended.id !== activeModule.id ? nextRecommended.id : null}
        />
      ) : (
        <>
          <section className="panel" aria-label="How each module works">
            <div className="panel-title">
              <h3>The shape of every module</h3>
              <span>Same rhythm, sixteen times</span>
            </div>
            <div className="practice-steps" aria-label="Module flow">
              {STAGES.map((stage, index) => (
                <span key={stage} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span className="step" data-on={index === 0}>{STAGE_LABELS[stage]}</span>
                  {index < STAGES.length - 1 && <span className="step-sep" aria-hidden="true">→</span>}
                </span>
              ))}
            </div>
            <p className="empty" style={{ marginTop: 12, marginBottom: 0 }}>
              Understand first (~10 minutes), produce in drills, rehearse with supports on, then perform with supports off.
              Every checkpoint is self-checked against visible criteria and banded honestly in CEFR sub-levels — no invented precision.
            </p>
          </section>

          <section className="panel" aria-label="Your progress">
            <div className="panel-title">
              <h3>Your progress</h3>
              <span>{completedTotal} of {FLUENCY_MODULES.length} modules completed</span>
            </div>
            <div className="stat-strip" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
              {FLUENCY_BANDS.map((band) => {
                const inBand = modulesForBand(band);
                const done = inBand.filter((m) => isComplete(progressMap[m.id])).length;
                return (
                  <div key={band} className="stat-tile">
                    <strong>{done}<small> / {inBand.length}</small></strong>
                    <span>{band} · {BAND_DESCRIPTIONS[band]}</span>
                  </div>
                );
              })}
            </div>
            {nextRecommended && (
              <div className="mission-row" style={{ marginTop: 14 }}>
                <span className="mi-num" aria-hidden="true">{nextRecommended.number}</span>
                <span className="mi-body">
                  <strong>Next recommended: {nextRecommended.title}</strong>
                  <small>{nextRecommended.purpose}</small>
                </span>
                <span className="mi-meta">
                  <button className="button" type="button" onClick={() => openModule(nextRecommended.id)}>
                    {isComplete(progressMap[nextRecommended.id]) ? "Resume module" : "Start module"}
                  </button>
                </span>
              </div>
            )}
            {!nextRecommended && completedTotal === FLUENCY_MODULES.length && (
              <p className="empty" style={{ margin: "12px 0 0" }}>
                Every module is complete. The track now lives in your conversations — keep it warm in the Conversation Gym.
              </p>
            )}
          </section>

          <section id="modules" aria-label="Module grid">
            <div className="filters" role="group" aria-label="Choose your track">
              <span className="f-label">Track</span>
              <button type="button" className="f-chip" data-active={trackFilter === "ALL"} onClick={() => setTrackFilter("ALL")}>All modules</button>
              <button type="button" className="f-chip" data-active={trackFilter === "BUSINESS"} onClick={() => setTrackFilter("BUSINESS")}>Business Fluency</button>
              <button type="button" className="f-chip" data-active={trackFilter === "LIFE"} onClick={() => setTrackFilter("LIFE")}>Life Fluency</button>
              <span className="filters-count">Business + Life modules serve both tracks</span>
            </div>

            {visibleByBand.map((group) => (
              <div key={group.band} style={{ marginBottom: 22 }}>
                <div className="ft-band-head">
                  <span className="ft-band">{group.band}</span>
                  <span className="ft-band-desc">{BAND_DESCRIPTIONS[group.band]}</span>
                </div>
                <div className="ft-grid">
                  {group.modules.map((module) => {
                    const done = isComplete(progressMap[module.id]);
                    return (
                      <button key={module.id} type="button" className="ft-card" data-done={done} onClick={() => openModule(module.id)}>
                        <span className="ft-num" aria-hidden="true">{module.number}</span>
                        <span className="ft-title">{module.title}</span>
                        <span className="ft-purpose">{module.purpose}</span>
                        <span className="ft-meta">
                          <span className="ft-badge" data-kind="band">{module.band}</span>
                          <span className="ft-badge" data-track={module.track}>{trackLabel(module.track)}</span>
                          {done && <span className="ft-badge" data-kind="band" style={{ background: "var(--success-soft)", color: "var(--success)" }}>Completed</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}


export default function FluencyTrackPage() {
  return (
    <ProductGate product="fluency-track">
      <FluencyTrackPageContent />
    </ProductGate>
  );
}
