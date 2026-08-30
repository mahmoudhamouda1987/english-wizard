'use client';

import { useEffect, useState } from 'react';

interface LqStats {
  sittings: number; answeredTotal: number; avgAnsweredPerSitting: number; speakingSubmissionRate: number; bankSize: number;
  variantDistribution: Array<{ variant: number; theme: string; sittings: number }>;
  cefrCoverage: Array<{ level: string; bankItems: number; attempted: number }>;
  topPresented: Array<{ itemId: string; attempts: number; successRate: number; skill: string; cefr: string }>;
  problematic: Array<{ itemId: string; attempts: number; successRate: number; skill: string; cefr: string; prompt: string }>;
}

export default function CurriculumStudioPage() {
  const [data, setData] = useState<{ versions: unknown[]; sources: unknown[]; audits: unknown[]; experiments: unknown[] } | null>(null);
  const [lqStats, setLqStats] = useState<LqStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview').then(async (response) => {
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Unable to load admin data.');
      setData(await response.json());
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load admin data.'));
    // LevelQuest question-bank performance (Part 33 — calibration foundation).
    fetch('/api/admin/levelquest-stats').then(async (response) => {
      if (!response.ok) return;
      setLqStats(await response.json());
    }).catch(() => { /* optional panel */ });
  }, []);

  return (
    <main id="main-content" className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">English Wizard</p>
        <h1 className="text-3xl font-semibold">Curriculum Studio</h1>
        <p className="mt-2 text-slate-600">Governance view for content versions, sources, audit events and experiments.</p>
      </header>
      {error && <div role="alert" className="rounded-lg border p-4">{error}</div>}
      {data && <div className="grid gap-4 md:grid-cols-4">
        <section className="rounded-xl border p-4"><h2 className="font-medium">Versions</h2><p className="mt-2 text-2xl">{data.versions.length}</p></section>
        <section className="rounded-xl border p-4"><h2 className="font-medium">Sources</h2><p className="mt-2 text-2xl">{data.sources.length}</p></section>
        <section className="rounded-xl border p-4"><h2 className="font-medium">Audit events</h2><p className="mt-2 text-2xl">{data.audits.length}</p></section>
        <section className="rounded-xl border p-4"><h2 className="font-medium">Experiments</h2><p className="mt-2 text-2xl">{data.experiments.length}</p></section>
      </div>}

      {lqStats && (
        <section className="rounded-xl border p-4">
          <h2 className="text-xl font-semibold">LevelCheck question bank</h2>
          <p className="mt-1 text-sm text-slate-600">Usage and success signals for future calibration — {lqStats.bankSize} bank items across 15 variants · {lqStats.sittings} sittings analysed · avg {lqStats.avgAnsweredPerSitting} answers/sitting · speaking submitted in {lqStats.speakingSubmissionRate}% of sittings.</p>

          <div className="mt-4 grid gap-3 md:grid-cols-7">
            {lqStats.cefrCoverage.map((c) => (
              <div key={c.level} className="rounded-lg border p-3 text-center">
                <div className="text-xs font-semibold text-slate-500">{c.level}</div>
                <div className="text-lg font-semibold">{c.bankItems}</div>
                <div className="text-xs text-slate-500">{c.attempted} attempts</div>
              </div>
            ))}
          </div>

          {lqStats.problematic.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Problematic questions (needs review)</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {lqStats.problematic.slice(0, 10).map((q) => (
                  <li key={q.itemId} className="rounded border p-2"><strong>{q.itemId}</strong> · {q.skill} · {q.cefr} · success {q.successRate}% over {q.attempts} attempts<br /><span className="text-slate-500">{q.prompt.slice(0, 110)}…</span></li>
                ))}
              </ul>
            </div>
          )}

          {lqStats.topPresented.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium">Most-presented questions</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-slate-500"><th className="p-2">Item</th><th className="p-2">Skill</th><th className="p-2">CEFR</th><th className="p-2">Attempts</th><th className="p-2">Success</th></tr></thead>
                  <tbody>
                    {lqStats.topPresented.slice(0, 12).map((q) => (
                      <tr key={q.itemId} className="border-t"><td className="p-2 font-mono text-xs">{q.itemId}</td><td className="p-2">{q.skill}</td><td className="p-2">{q.cefr}</td><td className="p-2">{q.attempts}</td><td className="p-2">{q.successRate}%</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
