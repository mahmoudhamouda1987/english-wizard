'use client';

import { useEffect, useState } from 'react';

export default function CurriculumStudioPage() {
  const [data, setData] = useState<{ versions: unknown[]; sources: unknown[]; audits: unknown[]; experiments: unknown[] } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/overview').then(async (response) => {
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? 'Unable to load admin data.');
      setData(await response.json());
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load admin data.'));
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
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
    </main>
  );
}
