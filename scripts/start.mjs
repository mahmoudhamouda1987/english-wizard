import { readFile } from "node:fs/promises";
import process from "node:process";
import { spawn } from "node:child_process";
import pg from "pg";

const { Pool } = pg;

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 10_000,
  });
  try {
    await pool.query(sql);
    console.log("[start] Database schema is ready.");
  } finally {
    await pool.end();
  }
}

try {
  await initializeDatabase();
  const host = process.env.HOSTNAME || "0.0.0.0";
  const port = process.env.PORT || "3000";
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", host, "-p", port], {
    stdio: "inherit",
    env: { ...process.env, HOSTNAME: host, PORT: port },
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exit(code ?? 1);
  });
  child.on("error", (error) => {
    console.error("[start] Failed to launch Next.js:", error);
    process.exit(1);
  });
} catch (error) {
  console.error("[start] Startup failed:", error);
  process.exit(1);
}
