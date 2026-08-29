"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/app/components/page-header";

type Chunk = { id: string; text: string; meaning: string; level: string; functions: string[]; variants: string[]; state?: { knowledge: string; encounters: number; productive_attempts: number; successful_productions: number } | null };

const K_CLASS: Record<string, string> = { NEW: "k-new", RECEPTIVE: "k-receptive", PRODUCTIVE: "k-productive" };

export default function ChunksPage() {
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => { fetch("/api/chunks").then(r => r.json()).then(d => setChunks(d.chunks ?? [])); }, []);

  async function mark(id: string, productive: boolean) {
    const response = await fetch("/api/chunks", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chunkId: id, productive, success: productive }) });
    if (response.ok) {
      const next = await response.json();
      setChunks(current => current.map(c => c.id === id ? { ...c, state: { ...(c.state ?? { encounters: 0, productive_attempts: 0, successful_productions: 0 }), knowledge: next.knowledge, encounters: next.encounters, productive_attempts: next.productiveAttempts, successful_productions: next.successfulProductions } } : c));
      setMessage(productive ? "Productive use recorded." : "Receptive encounter recorded.");
    }
  }

  const knowledge = (chunk: Chunk) => chunk.state?.knowledge ?? "NEW";

  return (
    <main id="main-content" style={{ maxWidth: 1080, margin: "0 auto", padding: "48px 24px" }}>
      <PageHeader
        eyebrow="Ready-made English"
        title="Chunks & Mediation"
        purpose="Real English arrives in ready-made blocks. Learn the block, spot the situation, deploy it — that is fluency."
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16, marginTop: 8 }}>
        {chunks.map(chunk => {
          const k = knowledge(chunk);
          return (
            <article key={chunk.id} className="panel" style={{ margin: 0, padding: 20, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <span className={`chip ${K_CLASS[k] ?? "k-new"}`}>{k}</span>
                <small className="subtle">{chunk.level}</small>
              </div>
              <h2 style={{ fontSize: 21, lineHeight: 1.4, margin: 0 }}>“{chunk.text}”</h2>
              <p className="subtle" style={{ margin: 0 }}>{chunk.meaning}</p>
              <div>
                {chunk.functions.map(f => <span key={f} className="chip">{f}</span>)}
              </div>
              {chunk.variants.length > 0 && (
                <details>
                  <summary className="link-button" style={{ cursor: "pointer", fontSize: 13 }}>Variants ({chunk.variants.length})</summary>
                  <p className="subtle" style={{ margin: "6px 0 0", fontSize: 13 }}>{chunk.variants.join(" · ")}</p>
                </details>
              )}
              <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                <button type="button" className="button secondary" onClick={() => mark(chunk.id, false)}>I recognise it</button>
                <button type="button" className="button" onClick={() => mark(chunk.id, true)}>I can use it</button>
              </div>
            </article>
          );
        })}
      </div>

      {message && (
        <div role="status" className="result-box" style={{ marginTop: 18 }}>{message}</div>
      )}
    </main>
  );
}
