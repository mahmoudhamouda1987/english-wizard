"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/app/components/page-header";
import { Celebration } from "@/app/components/celebration";
import { IconCheck, IconClock, IconMic, IconRoute } from "@/app/components/nav-icons";
import { ComparePicker } from "./compare-picker";

const CALIBRATION_PROMPTS = [
  "The rain in Spain stays mainly on the plain, but I still walk to work every morning.",
  "She sells sea shells by the sea shore, and I bought three of them last summer.",
  "I would be grateful if we could discuss the report before Thursday afternoon.",
];

interface Sample { id: string; prompt: string; transcript: string | null; durationMs: number | null; createdAt: string }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatSeconds(ms: number | null): string {
  return ms ? `${Math.round(ms / 1000)}s` : "—";
}

export default function TimeMachinePage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);
  const [compare, setCompare] = useState<{ older: Sample; newer: Sample } | null>(null);
  const [compareUrls, setCompareUrls] = useState<{ older: string; newer: string } | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  const prompt = CALIBRATION_PROMPTS[promptIndex];
  const forPrompt = useMemo(
    () => samples.filter((s) => s.prompt === prompt).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [samples, prompt],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const r = await fetch("/api/voice-samples", { cache: "no-store" });
      if (!r.ok) throw new Error("load-failed");
      setSamples(((await r.json()).samples ?? []) as Sample[]);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

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
      startedAtRef.current = Date.now();
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      setMicError("The microphone could not be started. Allow microphone access in your browser, then record again.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function saveSample() {
    if (!previewUrl) return;
    setSaving(true);
    setSaveError(null);
    try {
      const r = await fetch("/api/voice-samples", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, transcript: note.trim() || null, audioDataUrl: previewUrl, durationMs: Date.now() - startedAtRef.current }),
      });
      if (!r.ok) throw new Error("save-failed");
      setSavedOnce(true);
      setPreviewUrl(null); setNote("");
      await load();
    } catch {
      setSaveError("The recording could not be saved. Keep this tab open and press “Save to my timeline” again.");
    } finally {
      setSaving(false);
    }
  }

  async function openCompare(older: Sample, newer: Sample) {
    setCompareError(null);
    try {
      const fetchUrl = async (id: string) => (await (await fetch(`/api/voice-samples?id=${id}`, { cache: "no-store" })).json()).sample.audioDataUrl as string;
      setCompareUrls({ older: await fetchUrl(older.id), newer: await fetchUrl(newer.id) });
      setCompare({ older, newer });
    } catch {
      setCompareError("The recordings could not be loaded for comparison. Try again in a moment.");
    }
  }

  const longest = forPrompt.reduce((max, s) => Math.max(max, s.durationMs ?? 0), 0);

  return (
    <main id="main-content" className="dash-main">
      <PageHeader
        eyebrow="Practise — voice timeline"
        title="Voice Time Machine"
        purpose="Record the same sentence week after week, then play your earlier self beside your current self. Progress you can hear — calmly, without a score."
      />

      {loadError && (
        <div className="state-card error" role="alert">
          <strong>Your voice timeline could not be loaded.</strong>
          <div style={{ marginTop: 10 }}>
            <button className="button secondary" onClick={() => void load()}>Try again</button>
          </div>
        </div>
      )}

      {loading && !loadError && (
        <section className="panel" aria-hidden="true">
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" style={{ width: "85%" }} />
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          <div className="skeleton" style={{ height: 44, marginTop: 14, width: 200 }} />
          <span className="sr-only">Loading your voice timeline…</span>
        </section>
      )}

      {!loading && !loadError && (
        <>
          <section className="panel" aria-label="Record a new attempt">
            <div className="panel-title">
              <h3>Record today&rsquo;s attempt</h3>
              <span>Calibration sentence {promptIndex + 1} of {CALIBRATION_PROMPTS.length}</span>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: "clamp(18px, 2vw, 23px)", lineHeight: 1.55, margin: "0 0 16px", fontWeight: 600 }}>“{prompt}”</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              {!recording ? (
                <button className="button" onClick={() => void startRecording()}><IconMic size={15} /> Record now</button>
              ) : (
                <button className="button recording" onClick={stopRecording} aria-label="Stop recording"><IconMic size={15} /> Stop recording</button>
              )}
              <select
                aria-label="Choose calibration sentence"
                value={promptIndex}
                onChange={(e) => { setPromptIndex(Number(e.target.value)); setPreviewUrl(null); }}
                style={{ maxWidth: 240 }}
              >
                {CALIBRATION_PROMPTS.map((_, i) => <option key={i} value={i}>Sentence {i + 1}</option>)}
              </select>
            </div>
            {recording && <p className="empty" style={{ marginTop: 12 }} role="status">Recording… read the sentence at your natural pace, then stop.</p>}
            {micError && <div className="state-card error" style={{ marginTop: 12 }} role="alert">{micError}</div>}

            {previewUrl && (
              <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                <audio controls src={previewUrl} aria-label="Preview of your recording" />
                <label className="f-label" htmlFor="tm-note">Optional note</label>
                <input id="tm-note" aria-label="Optional note about this attempt" placeholder="How did this attempt feel? Note anything you noticed." value={note} onChange={(e) => setNote(e.target.value)} />
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button className="button" disabled={saving} onClick={() => void saveSample()}>{saving ? "Saving…" : "Save to my timeline"}</button>
                  <button className="button secondary" onClick={() => { setPreviewUrl(null); setSaveError(null); }}>Discard</button>
                </div>
                {saveError && <div className="state-card error" role="alert">{saveError}</div>}
              </div>
            )}
          </section>

          {forPrompt.length >= 2 && (
            <section className="panel" aria-label="Compare two attempts">
              <div className="panel-title">
                <h3>Compare two moments</h3>
                <span>Earlier attempt beside current attempt</span>
              </div>
              <ComparePicker samples={forPrompt} onCompare={(o, n) => void openCompare(o, n)} />
              {compareError && <div className="state-card error" style={{ marginTop: 12 }} role="alert">{compareError}</div>}
              {compare && compareUrls && (
                <>
                  <div className="tm-grid" style={{ marginTop: 16 }}>
                    <div className="tm-side" data-side="then">
                      <strong>Earlier attempt</strong>
                      <small>{formatDate(compare.older.createdAt)} · {formatSeconds(compare.older.durationMs)}</small>
                      <audio controls src={compareUrls.older} aria-label="Your earlier recording" />
                      <small>{compare.older.transcript ? `You noted: “${compare.older.transcript}”` : "No note was left on this attempt."}</small>
                    </div>
                    <div className="tm-side" data-side="now">
                      <strong>Current attempt</strong>
                      <small>{formatDate(compare.newer.createdAt)} · {formatSeconds(compare.newer.durationMs)}</small>
                      <audio controls src={compareUrls.newer} aria-label="Your current recording" />
                      <small>{compare.newer.transcript ? `You noted: “${compare.newer.transcript}”` : "No note was left on this attempt."}</small>
                    </div>
                  </div>
                  <div className="conv-next" style={{ marginTop: 14 }}>
                    <IconRoute size={16} />
                    <span>
                      <strong>What changed:</strong>{" "}
                      {compare.older.durationMs && compare.newer.durationMs
                        ? `${Math.abs(compare.older.durationMs - compare.newer.durationMs) < 500
                          ? "almost the same length"
                          : compare.newer.durationMs < compare.older.durationMs
                            ? `${Math.round((compare.older.durationMs - compare.newer.durationMs) / 1000)} seconds quicker`
                            : `${Math.round((compare.newer.durationMs - compare.older.durationMs) / 1000)} seconds longer`}.
                          Listen for steadier pacing, fewer restarts and clearer sentence stress — that is the real difference.`
                        : "Listen for steadier pacing, fewer restarts and clearer sentence stress — that is the real difference."}
                      {" "}Play the earlier attempt first, then the current one, twice each.
                    </span>
                  </div>
                </>
              )}
            </section>
          )}

          {forPrompt.length >= 1 && (
            <section className="panel" aria-label="Recording length over time">
              <div className="panel-title">
                <h3>Your timeline for sentence {promptIndex + 1}</h3>
                <span>{forPrompt.length} {forPrompt.length === 1 ? "attempt" : "attempts"}</span>
              </div>
              <div className="tm-trend">
                {forPrompt.map((s) => (
                  <div key={s.id} className="tm-trend-row">
                    <small>{formatDate(s.createdAt)}</small>
                    <div className="bar" aria-hidden="true">
                      <i style={{ width: `${longest > 0 ? Math.max(8, Math.round(((s.durationMs ?? 0) / longest) * 100)) : 8}%` }} />
                    </div>
                    <span><IconClock size={12} /> {formatSeconds(s.durationMs)}</span>
                  </div>
                ))}
              </div>
              <p className="empty" style={{ marginTop: 12, marginBottom: 0 }}>
                The bars show recording length only — a calm, honest signal. Shorter is not automatically better; steadiness is. Judge the trend with your ears above.
              </p>
            </section>
          )}

          <section className="panel" aria-label="All recordings">
            <div className="panel-title">
              <h3>All recordings</h3>
              <span>{samples.length} saved</span>
            </div>
            {samples.length === 0 && (
              <div className="state-card info">
                <strong>What this area is:</strong> a private timeline of your speaking voice. Record the same calibration sentences now and again over the coming weeks.
                <p className="empty" style={{ marginTop: 8 }}>
                  <IconCheck size={14} /> What to do now: record sentence 1 above — your first attempt becomes the “earlier” side of every future comparison.
                </p>
              </div>
            )}
            {samples.length > 0 && (
              <div style={{ display: "grid", gap: 10 }}>
                {samples.map((s) => (
                  <article key={s.id} className="mission-row" aria-label={`Recording from ${formatDate(s.createdAt)}`}>
                    <span className="mi-num" aria-hidden="true"><IconMic size={14} /></span>
                    <span className="mi-body">
                      <strong>Sentence {CALIBRATION_PROMPTS.indexOf(s.prompt) + 1}</strong>
                      <small>
                        {new Date(s.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {s.durationMs ? ` · ${formatSeconds(s.durationMs)}` : ""}
                        {s.transcript ? ` · “${s.transcript.slice(0, 60)}”` : ""}
                      </small>
                    </span>
                    <span className="mi-meta">
                      <a className="button secondary" href={`/api/voice-samples?id=${s.id}`} target="_blank" rel="noreferrer">Play</a>
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Celebration trigger={savedOnce ? `s${samples.length}` : ""} />
    </main>
  );
}
