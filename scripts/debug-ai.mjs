const base = "http://127.0.0.1:3000";
const email = `aidbg-${Date.now()}@example.com`;
const reg = await fetch(`${base}/api/auth/register`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, displayName: "AI Debug", password: "StrongPass123!" }) });
const cookie = reg.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
console.log("register:", reg.status);
const r = await fetch(`${base}/api/ai/writing`, { method: "POST", headers: { "content-type": "application/json", cookie }, body: JSON.stringify({ prompt: "Write one short sentence about your daily routine.", answer: "I go to work at eight every day." }) });
console.log("writing:", r.status, (await r.text()).slice(0, 500));
