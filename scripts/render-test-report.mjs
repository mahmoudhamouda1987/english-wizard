/**
 * Renders a test placement PDF through the running app:
 * register → complete an adaptive sitting → finalize → GET /api/levelquest/report.
 * Saves the PDF (or the error HTML) for inspection.
 *
 * Usage: node scripts/render-test-report.mjs [baseUrl] [outPrefix]
 */
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const PREFIX = process.argv[3] ?? "report";
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

const email = `${PREFIX}.${Date.now()}@ew-render.test`;
const reg = await api("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ email, displayName: "Render Tester", password: "R3nder-2026!" }),
});
if (reg.status !== 200) {
  console.error("register failed", reg.status, await reg.text());
  process.exit(1);
}
await api("/api/profile", { method: "POST", body: JSON.stringify({ displayName: "Render Tester", dailyMinutes: 20, targetLevel: "B1" }) });

const start = await (await api("/api/levelquest")).json();
if (!start.sessionId) {
  console.error("no session:", JSON.stringify(start).slice(0, 300));
  process.exit(1);
}
console.log("session", start.sessionId, "variant", start.variant);

let state = start;
let answered = 0;
for (let i = 0; i < 12; i++) {
  const item = state.paper[answered];
  if (!item) break;
  const answer = item.type === "speaking" ? "I have been studying English for several years because I want to work abroad, and I usually practise by watching films and speaking with friends." : (item.options?.[0] ?? "a");
  const res = await (await api("/api/levelquest", { method: "POST", body: JSON.stringify({ sessionId: start.sessionId, itemId: item.id, answer }) })).json();
  if (!res.ok) { console.error("answer rejected:", JSON.stringify(res).slice(0, 200)); process.exit(1); }
  answered += 1;
  if (res.appended) state = { ...state, paper: [...state.paper, res.appended] };
}
console.log("answered", answered, "items");

const fin = await (await api("/api/levelquest", { method: "POST", body: JSON.stringify({ sessionId: start.sessionId, finalize: true }) })).json();
if (!fin.result) { console.error("finalize failed:", JSON.stringify(fin).slice(0, 300)); process.exit(1); }
console.log("finalized level:", fin.result.level, "confidence:", fin.result.confidence, "answeredCount:", fin.result.answeredCount);

const pdfRes = await api("/api/levelquest/report");
const body = Buffer.from(await pdfRes.arrayBuffer());
if (pdfRes.status !== 200 || !body.subarray(0, 4).toString().startsWith("%PDF")) {
  console.error("PDF FAILED status", pdfRes.status);
  fs.writeFileSync(`/tmp/${PREFIX}-error.html`, body);
  console.error("error body saved to /tmp/" + PREFIX + "-error.html");
  const text = body.toString();
  const m = text.match(/<p style="color:#64748b;line-height:1.6">([\s\S]*?)<\/p>/);
  if (m) console.error("error message:", m[1]);
  process.exit(1);
}
fs.writeFileSync(`/tmp/${PREFIX}.pdf`, body);
console.log(`PDF saved: /tmp/${PREFIX}.pdf (${body.length} bytes)`);

// Also capture the web report page HTML for visual check
const page = await api("/report");
const html = await page.text();
fs.writeFileSync(`/tmp/${PREFIX}-web.html`, html);
console.log(`web report page: ${page.status}, saved /tmp/${PREFIX}-web.html`);
