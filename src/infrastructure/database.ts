import { Pool, type QueryResultRow } from "pg";

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

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []) {
  return getDatabase().query<T>(text, values);
}
