import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL && existsSync(new URL("../.env", import.meta.url))) {
  for (const line of (await readFile(new URL("../.env", import.meta.url), "utf8")).split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  console.warn("[predeploy] DATABASE_URL not available at build time; skipping schema apply (runtime start applies it).");
  process.exit(0);
}

const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 10_000,
});

try {
  await pool.query(sql);
  console.log("Database schema is ready.");
} catch (error) {
  console.error("Database initialization failed:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
