import { readFile } from "node:fs/promises";
import process from "node:process";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for database initialization.");
  process.exit(1);
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
