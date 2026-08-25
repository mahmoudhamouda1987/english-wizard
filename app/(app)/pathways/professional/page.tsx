"use client";

import { useEffect, useState } from "react";

interface Domain { id: string; label: string; blurb: string; trackCount: number; tracks: Array<{ id: string; label: string }> }

export default function ProfessionalPage() {
  const [domains, setDomains] = useState<Domain[] | null>(null);
  const [active, setActive] = useState<Domain | null>(null);
  const [customField, setCustomField] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [customGoals, setCustomGoals] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (domains) return;
    setLoading(true);
    fetch("/api/pathways")
      .then(async (r) => { const data = await r.json(); setDomains(data.catalog.professional.domains); })
      .catch(() => setError("Failed to load domains."))
      .finally(() => setLoading(false));
  }, [domains]);

  if (!domains) {
    return <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>{loading ? <p>Loading professional domains…</p> : <p>{error || "Loading…"}</p>}</main>;
  }

  async function submitCustom() {
    if (!customField.trim()) return;
    setLoading(true);
    try {
      const r = await fetch("/api/pathways", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathway: "PROFESSIONAL", domain: customField.trim(), target: `custom-${customField.trim()}` }) });
      if (r.ok) setSelected("custom-created");
    } catch { setError("Submission failed."); }
    setLoading(false);
  }

  async function selectTrack(domainId: string, trackId: string) {
    setLoading(true);
    try {
      const r = await fetch("/api/pathways", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pathway: "PROFESSIONAL", domain: domainId, track: trackId }) });
      if (r.ok) setSelected(trackId);
    } catch { setError("Selection failed."); }
    setLoading(false);
  }

  if (selected) return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div className="panel" style={{ padding: 24, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 8px" }}>✓ Pathway saved</h2>
        <p className="subtle" style={{ margin: "0 0 18px" }}>{selected === "custom-created" ? `Custom pathway for "${customField}" created — your adaptive engine will build modules around this field.` : `Track "${selected}" activated — the platform will now surface domain-specific practice in your learning loop.`}</p>
        <button className="button" onClick={() => { setSelected(null); setActive(null); }}>Continue</button>
      </div>
    </main>
  );

  if (active) return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">{active.label}</p>
      <h1>{active.label} — tracks</h1>
      <p className="subtle">{active.blurb}</p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {active.tracks.map((track) => (
          <button key={track.id} onClick={() => { void selectTrack(active.id, track.id); }} className="button secondary" style={{ textAlign: "left", padding: "12px 16px" }}>
            <strong>{track.label}</strong>
          </button>
        ))}
      </div>
      <button className="button secondary" style={{ marginTop: 18 }} onClick={() => setActive(null)}>← All domains</button>
    </main>
  );

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Start My Professional Way</p>
      <h1>Choose your business domain</h1>
      <p className="subtle">Each domain contains real tracks with domain-specific vocabulary, meetings, emails, presentations and roleplays.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10, marginTop: 24 }}>
        {domains.map((domain) => <button key={domain.id} onClick={() => setActive(domain)} className="button secondary" style={{ padding: 14, textAlign: "left", fontSize: 14 }}><strong>{domain.label}</strong><br /><span className="subtle" style={{ fontSize: 12 }}>{domain.trackCount} tracks</span></button>)}
      </div>
      <section style={{ marginTop: 36, padding: 24, background: "#f0f4ff", borderRadius: 14, border: "1px solid #d0daf0" }}>
        <h2 style={{ margin: "0 0 6px" }}>Or create your own</h2>
        <p className="subtle" style={{ margin: "0 0 12px" }}>Enter your business field — the platform builds a professional English pathway around it.</p>
        <input value={customField} onChange={(e) => setCustomField(e.target.value)} placeholder="e.g. Dental practice management, SaaS sales" style={{ width: "100%", padding: "10px 14px", fontSize: 14, marginBottom: 8 }} />
        <input value={customRole} onChange={(e) => setCustomRole(e.target.value)} placeholder="Your role (optional)" style={{ width: "100%", padding: "10px 14px", fontSize: 14, marginBottom: 8 }} />
        <textarea value={customGoals} onChange={(e) => setCustomGoals(e.target.value)} placeholder="Specific goals, one per line (optional)" rows={3} style={{ width: "100%", padding: "10px 14px", fontSize: 14 }} />
        <button className="button" style={{ marginTop: 10 }} onClick={() => void submitCustom()} disabled={loading || !customField.trim()}>{loading ? "Creating…" : "Create custom pathway"}</button>
      </section>
    </main>
  );
}
