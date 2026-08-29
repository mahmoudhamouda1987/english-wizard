import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync, existsSync } from "node:fs";
import net from "node:net";
const path = await import("node:path");

const dataDir = path.join(process.env.TEMP ?? ".tmp", "opencode", "ew-pg-data");
const PORT = 5433;

function alreadyRunning() {
  return new Promise((resolve) => {
    const s = net.createConnection({ port: PORT, host: "127.0.0.1" });
    s.once("connect", () => { s.destroy(); resolve(true); });
    s.once("error", () => resolve(false));
    s.setTimeout(1500, () => { s.destroy(); resolve(false); });
  });
}

async function main() {
  // Idempotent: if a daemon (or any postgres) already owns the port, do nothing.
  if (await alreadyRunning()) {
    console.log(`PG READY on ${PORT} (already running, persistent)`);
    return;
  }
  mkdirSync(dataDir, { recursive: true });
  const initialised = existsSync(path.join(dataDir, "PG_VERSION"));
  const pg = new EmbeddedPostgres({ databaseDir: dataDir, user: "postgres", password: "postgres", port: PORT, persistent: true });
  // Fresh-machine path: initialise the cluster once before first start.
  if (!initialised) await pg.initialise();
  try { await pg.start(); } catch (e) { const msg = e instanceof Error ? e.message : String(e); console.error(msg); process.exit(1); }
  try { await pg.createDatabase("english_wizard"); } catch {}
  console.log(`PG READY on ${PORT} (persistent)`);
}

main().catch((e) => { console.error(e instanceof Error ? e.stack : String(e)); process.exit(1); });
setInterval(() => undefined, 10_000);
