import { NextResponse } from 'next/server';
import { currentUser } from '@/src/infrastructure/auth';
import { requireAdmin } from '@/src/infrastructure/admin-guard';
import { query } from '@/src/infrastructure/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdmin();
  if (guard.denied) return guard.denied;

  const [versions, sources, audits, experiments] = await Promise.all([
    query('SELECT entity_id, kind, version, created_by, created_at, change_summary FROM content_versions ORDER BY created_at DESC LIMIT 50'),
    query('SELECT id, title, source_type, rights, approved_for_rag, url FROM knowledge_sources ORDER BY created_at DESC LIMIT 50'),
    query('SELECT action, entity_type, entity_id, actor_id, occurred_at FROM audit_events ORDER BY occurred_at DESC LIMIT 50'),
    query('SELECT id, name, status, primary_learning_metric, guardrail_metrics FROM experiments ORDER BY id LIMIT 50'),
  ]);

  return NextResponse.json({ versions: versions.rows, sources: sources.rows, audits: audits.rows, experiments: experiments.rows });
}
