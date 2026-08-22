"use client";

import { useState } from "react";

interface Sample { id: string; prompt: string; transcript: string | null; durationMs: number | null; createdAt: string }

export function ComparePicker({ samples, onCompare }: { samples: Sample[]; onCompare: (older: Sample, newer: Sample) => void }) {
  const [olderId, setOlderId] = useState("");
  const [newerId, setNewerId] = useState("");

  const label = (s: Sample) => new Date(s.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 12 }}>
      <label style={{ display: "grid", gap: 4 }}>
        <small className="subtle">Then</small>
        <select value={olderId} onChange={(e) => setOlderId(e.target.value)} style={{ minWidth: 170 }}>
          <option value="">Choose earlier date…</option>
          {samples.map((s) => <option key={s.id} value={s.id}>{label(s)}</option>)}
        </select>
      </label>
      <span aria-hidden="true" style={{ fontSize: 20 }}>→</span>
      <label style={{ display: "grid", gap: 4 }}>
        <small className="subtle">Now</small>
        <select value={newerId} onChange={(e) => setNewerId(e.target.value)} style={{ minWidth: 170 }}>
          <option value="">Choose later date…</option>
          {samples.map((s) => <option key={s.id} value={s.id}>{label(s)}</option>)}
        </select>
      </label>
      <button
        className="button"
        disabled={!olderId || !newerId || olderId === newerId}
        onClick={() => {
          const older = samples.find((s) => s.id === olderId);
          const newer = samples.find((s) => s.id === newerId);
          if (older && newer && older.createdAt <= newer.createdAt) onCompare(older, newer);
        }}
      >
        Hear my progress
      </button>
    </div>
  );
}
