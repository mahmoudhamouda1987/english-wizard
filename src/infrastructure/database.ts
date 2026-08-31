import { Pool, type QueryResultRow } from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";

let pool: Pool | undefined;

function sslConfig(): false | { rejectUnauthorized: false } {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is required for persistent learner state.");

  const explicit = process.env.DATABASE_SSL?.toLowerCase();
  if (explicit === "false") return false;
  if (explicit === "true") return { rejectUnauthorized: false };

  try {
    const host = new URL(rawUrl).hostname;
    const local = host === "127.0.0.1" || host === "localhost" || host === "postgres";
    return local ? false : { rejectUnauthorized: false };
  } catch {
    return false;
  }
}

export function getDatabase(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for persistent learner state.");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: sslConfig(),
  });

  return pool;
}

/* ── Runtime schema self-healing (Task 32-b incident fix) ───────────────────
 * Platforms apply db/schema.sql at different stages: Railway runs it in
 * start.mjs (always works), Vercel runs it in predeploy-db.mjs at BUILD time —
 * which is silently skipped when DATABASE_URL is unavailable or unreachable
 * from the build runner. When that happens the deployed code races ahead of
 * the database and every learner_profiles query 500s (the Task 32 avatar
 * columns incident). This guard makes every runtime converge: the first query
 * in a process ensures the schema (idempotent — CREATE TABLE IF NOT EXISTS /
 * ADD COLUMN IF NOT EXISTS), applied at most once per process, retried on the
 * next query if it fails. */
let schemaPromise: Promise<void> | null = null;

/** Critical-column fallback for the (unlikely) case the schema file itself is
 * not traced into a serverless bundle. Mirrors the learner_profiles ALTERs;
 * the full schema still comes from the file / predeploy / start.mjs. */
const CRITICAL_SCHEMA_FALLBACK = `
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS pathway_selection JSONB;
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE learner_profiles ADD COLUMN IF NOT EXISTS avatar_kind TEXT NOT NULL DEFAULT 'initials';
`;

async function loadSchemaSql(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), "db", "schema.sql"),
    path.join(process.cwd(), "..", "db", "schema.sql"),
  ];
  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // try the next candidate
    }
  }
  return CRITICAL_SCHEMA_FALLBACK;
}

export function ensureSchema(): Promise<void> {
  schemaPromise ??= (async () => {
    const sql = await loadSchemaSql();
    await getDatabase().query(sql);
  })().catch((error: unknown) => {
    schemaPromise = null; // allow the next query to retry the apply
    throw error;
  });
  return schemaPromise;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureSchema();
  return getDatabase().query<T>(text, values);
}
