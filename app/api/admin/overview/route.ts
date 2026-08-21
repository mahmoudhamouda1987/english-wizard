import { NextResponse } from 'next/server';
import { currentUser } from '@/src/infrastructure/auth';
import { query } from '@/src/infrastructure/database';

export const dynamic = 'force-dynamic';

function isAdmin(email: string): boolean {
  const allowlist = (process.env.ADMIN_EMAILS ?? '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  return allowlist.includes(email.toLowerCase());
}

export async function GET() {
  const session = await currentUser();
  if (!session) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  if (!isAdmin(session.email)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  const [versions, sources, audits, experiments] = await Promise.all([
    query('SELECT entity_id, kind, version, created_by, created_at, change_summary FROM content_versions ORDER BY created_at DESC LIMIT 50'),
    query('SELECT id, title, source_type, rights, approved_for_rag, url FROM knowledge_sources ORDER BY created_at DESC LIMIT 50'),
    query('SELECT action, entity_type, entity_id, actor_id, occurred_at FROM audit_events ORDER BY occurred_at DESC LIMIT 50'),
    query('SELECT id, name, status, primary_learning_metric, guardrail_metrics FROM experiments ORDER BY id LIMIT 50'),
  ]);

  return NextResponse.json({ versions: versions.rows, sources: sources.rows, audits: audits.rows, experiments: experiments.rows });
}
