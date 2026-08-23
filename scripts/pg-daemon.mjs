import EmbeddedPostgres from "embedded-postgres";
const path = await import("node:path");
const dataDir = path.join(process.env.TEMP ?? ".tmp", "opencode", "ew-pg-data");
const pg = new EmbeddedPostgres({ databaseDir: dataDir, user: "postgres", password: "postgres", port: 5433, persistent: true });
try { await pg.start(); } catch (e) { if (!String(e).includes("already")) { console.error(e.message); process.exit(1); } }
try { await pg.createDatabase("english_wizard"); } catch {}
console.log("PG READY on 5433 (persistent)");
setInterval(() => undefined, 10_000);
