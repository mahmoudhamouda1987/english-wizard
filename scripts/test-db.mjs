import EmbeddedPostgres from "embedded-postgres";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.env.TEMP ?? ".tmp", "opencode", "ew-pg-data");
rmSync(dataDir, { recursive: true, force: true });
mkdirSync(dataDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port: 5433,
  persistent: false,
});

await pg.initialise();
await pg.start();
await pg.createDatabase("english_wizard");
console.log("TEST PG READY on 127.0.0.1:5433 db=english_wizard");

process.on("message", async (msg) => {
  if (msg === "shutdown") {
    await pg.stop();
    process.exit(0);
  }
});
setInterval(() => undefined, 10_000);
