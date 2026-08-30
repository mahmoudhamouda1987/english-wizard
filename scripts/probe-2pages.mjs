import { chromium } from "playwright";

const base = "http://127.0.0.1:3000";
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
page.on("pageerror", (e) => errors.push("PAGEERROR: " + String(e).slice(0, 200)));

const email = `probe-${Date.now()}@example.com`;
const reg = await page.request.post(`${base}/api/auth/register`, {
  data: { email, displayName: "Probe", password: "StrongPass123!" },
});
console.log("register:", reg.status());

for (const path of ["/ielts", "/cambridge", "/fluency-track"]) {
  errors.length = 0;
  const resp = await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(3000);
  const mainCount = await page.locator("main").count();
  const body = await page.locator("body").innerText().catch(() => "<body failed>");
  console.log(`\n=== ${path} status=${resp.status()} main=${mainCount}`);
  console.log("body[:300]:", body.slice(0, 300).replace(/\n+/g, " | "));
  console.log("console errors:", errors.slice(0, 3));
}
await browser.close();
