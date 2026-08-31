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
    const db = getDatabase();
    const statements = splitStatements(sql);
    let failures = 0;
    let firstError: unknown = null;
    for (const statement of statements) {
      try {
        await db.query(statement);
      } catch (error) {
        // Per-statement tolerance: a restricted runtime role (statement
        // timeout, table ownership, concurrent cold-start race) must not
        // block the remaining statements — most importantly the column
        // additions the deployed code depends on. Benign "already exists"
        // outcomes land here too and are equally harmless.
        failures++;
        firstError ??= error;
      }
    }
    if (failures >= statements.length) {
      // Nothing applied — the database itself is unreachable; surface it.
      throw firstError instanceof Error ? firstError : new Error(String(firstError));
    }
    if (failures > 0) {
      console.warn(
        `[schema] runtime apply finished with ${failures}/${statements.length} statements skipped; ` +
        `first: ${firstError instanceof Error ? firstError.message : String(firstError)}`,
      );
    }
  })().catch((error: unknown) => {
    schemaPromise = null; // allow the next query to retry the apply
    throw error;
  });
  return schemaPromise;
}

/** Split the schema file into individual statements. db/schema.sql is written
 * one statement per line/block with no semicolons inside string literals or
 * functions, so a comment-strip + semicolon split is exact for this file. */
function splitStatements(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  await ensureSchema();
  return getDatabase().query<T>(text, values);
}
