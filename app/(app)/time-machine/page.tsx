"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PageHero } from "@/app/components/page-hero";
import { Celebration } from "@/app/components/celebration";
import { ComparePicker } from "./compare-picker";

const CALIBRATION_PROMPTS = [
  "The rain in Spain stays mainly on the plain, but I still walk to work every morning.",
  "She sells sea shells by the sea shore, and I bought three of them last summer.",
  "I would be grateful if we could discuss the report before Thursday afternoon.",
];

interface Sample { id: string; prompt: string; transcript: string | null; durationMs: number | null; createdAt: string }

export default function TimeMachinePage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [promptIndex, setPromptIndex] = useState(0);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [compare, setCompare] = useState<{ older: Sample; newer: Sample } | null>(null);
  const [compareUrls, setCompareUrls] = useState<{ older: string; newer: string } | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);

  const prompt = CALIBRATION_PROMPTS[promptIndex];
  const forPrompt = useMemo(() => samples.filter((s) => s.prompt === prompt).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), [samples, prompt]);

  async function load() {
    const r = await fetch("/api/voice-samples", { cache: "no-store" });
    if (r.ok) setSamples((await r.json()).samples as Sample[]);
  }
  useEffect(() => { void load(); }, []);

  async function startRecording() {
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
      alert("Microphone access is required to record. Please allow it and try again.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  async function saveSample() {
    if (!previewUrl) return;
    setSaving(true);
    try {
      const r = await fetch("/api/voice-samples", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, transcript: note.trim() || null, audioDataUrl: previewUrl, durationMs: Date.now() - startedAtRef.current }),
      });
      if (r.ok) {
        setSavedOnce(true);
        setPreviewUrl(null); setNote("");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function openCompare(older: Sample, newer: Sample) {
    const fetchUrl = async (id: string) => (await (await fetch(`/api/voice-samples?id=${id}`, { cache: "no-store" })).json()).sample.audioDataUrl as string;
    setCompareUrls({ older: await fetchUrl(older.id), newer: await fetchUrl(newer.id) });
    setCompare({ older, newer });
  }

  return (
    <main id="main-content" className="dash-main">
      <PageHero icon="⏳" title="Voice Time Machine" sub="Record the same sentence month after month, then play your past self beside your present self. Progress you can hear — no score needed." />
      <Celebration trigger={savedOnce ? `s${samples.length}` : ""} />

      <section className="panel" style={{ padding: 24 }}>
        <p className="eyebrow">Calibration sentence {promptIndex + 1} of {CALIBRATION_PROMPTS.length}</p>
        <h2 style={{ fontSize: 22, lineHeight: 1.5, margin: "8px 0 14px" }}>“{prompt}”</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          {!recording ? (
            <button className="button" onClick={() => void startRecording()}>🎙️ Record now</button>
          ) : (
            <button className="button" onClick={stopRecording} style={{ background: "#ef4444" }}>⏹ Stop recording</button>
          )}
          <select aria-label="Choose calibration sentence" value={promptIndex} onChange={(e) => { setPromptIndex(Number(e.target.value)); setPreviewUrl(null); }} style={{ maxWidth: 240 }}>
            {CALIBRATION_PROMPTS.map((_, i) => <option key={i} value={i}>Sentence {i + 1}</option>)}
          </select>
        </div>

        {previewUrl && (
          <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
            <audio controls src={previewUrl} />
            <input aria-label="Optional note about this attempt" placeholder="Optional note — how did it feel?" value={note} onChange={(e) => setNote(e.target.value)} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="button" disabled={saving} onClick={() => void saveSample()}>{saving ? "Saving…" : "💾 Save to my timeline"}</button>
              <button className="button secondary" onClick={() => setPreviewUrl(null)}>Discard</button>
            </div>
          </div>
        )}
      </section>

      {forPrompt.length >= 2 && (
        <section className="panel" style={{ marginTop: 18, padding: 22 }}>
          <div className="panel-title"><h3>Compare two moments</h3></div>
          <ComparePicker samples={forPrompt} onCompare={(o, n) => void openCompare(o, n)} />
          {compare && compareUrls && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14, marginTop: 16 }}>
              <div className="panel" style={{ margin: 0, padding: 16 }}>
                <strong>Then · {new Date(compare.older.createdAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</strong>
                <audio style={{ width: "100%", marginTop: 8 }} controls src={compareUrls.older} />
              </div>
              <div className="panel" style={{ margin: 0, padding: 16, borderLeft: "4px solid #10b981" }}>
                <strong>Now · {new Date(compare.newer.createdAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</strong>
                <audio style={{ width: "100%", marginTop: 8 }} controls src={compareUrls.newer} />
              </div>
            </div>
          )}
        </section>
      )}

      <section style={{ marginTop: 20 }}>
        <p className="eyebrow">Your recordings ({samples.length})</p>
        {samples.length === 0 && <div className="state-card">No recordings yet — your first one becomes the “then” side of every future comparison.</div>}
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {samples.map((s) => (
            <article key={s.id} className="panel" style={{ margin: 0, padding: 16, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <strong>Sentence {CALIBRATION_PROMPTS.indexOf(s.prompt) + 1}</strong>
                <small className="subtle" style={{ display: "block" }}>{new Date(s.createdAt).toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}{s.durationMs ? ` · ${Math.round(s.durationMs / 1000)}s` : ""}{s.transcript ? ` · “${s.transcript.slice(0, 60)}”` : ""}</small>
              </div>
              <a className="button secondary" href={`/api/voice-samples?id=${s.id}`} target="_blank" rel="noreferrer">Play</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
