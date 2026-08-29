/**
 * Renders an INCOMPLETE placement PDF: register → start session → finalize with
 * zero answers → GET /api/levelquest/report. Saves /tmp/incomplete.pdf.
 */
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
let cookie = "";

async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}), ...(opts.headers ?? {}) },
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  return res;
}

const email = `incomplete.${Date.now()}@ew-render.test`;
const reg = await api("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email, displayName: "Empty Sitter", password: "R3nder-2026!" }),
});
if (reg.status !== 200) { console.error("register failed", reg.status); process.exit(1); }

const start = await (await api("/api/levelquest")).json();
if (!start.sessionId) { console.error("no session"); process.exit(1); }

const fin = await (await api("/api/levelquest", { method: "POST", body: JSON.stringify({ sessionId: start.sessionId, finalize: true }) })).json();
console.log("finalize level:", fin.result?.level, "| status marker:", fin.result?.level ?? "(none — expected)");

const pdfRes = await api("/api/levelquest/report");
const body = Buffer.from(await pdfRes.arrayBuffer());
if (pdfRes.status !== 200 || !body.subarray(0, 4).toString().startsWith("%PDF")) {
  console.error("INCOMPLETE PDF FAILED", pdfRes.status, body.toString().slice(0, 300));
  process.exit(1);
}
fs.writeFileSync("/tmp/incomplete.pdf", body);
console.log(`INCOMPLETE PDF saved: /tmp/incomplete.pdf (${body.length} bytes)`);
