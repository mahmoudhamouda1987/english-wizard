import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = "http://127.0.0.1:3000";
const out = "/tmp/ew-shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Register a learner for app pages.
const email = `visual-${Date.now()}@example.com`;
await page.request.post(`${base}/api/auth/register`, {
  data: { email, displayName: "Visual QA", password: "StrongPass123!" },
});

async function shot(path, name, { dark = false, mobile = false } = {}) {
  const p = mobile
    ? await (async () => {
        const c = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
        await c.request.post(`${base}/api/auth/register`, {
          data: { email: `m-${Date.now()}@example.com`, displayName: "Mobile QA", password: "StrongPass123!" },
        });
        return c.newPage();
      })()
    : page;
  if (dark) await page.evaluate(() => { try { localStorage.setItem("ew-theme", "dark"); } catch {} }).catch(() => {});
  await p.goto(base + path, { waitUntil: "domcontentloaded", timeout: 20000 });
  await p.waitForTimeout(1800);
  const themeTag = dark ? "-dark" : "";
  const mobTag = mobile ? "-mobile" : "";
  await p.screenshot({ path: `${out}/${name}${mobTag}${themeTag}.png`, fullPage: false });
  if (mobile) await p.context().close();
  console.log("shot:", name, mobile ? "mobile" : "", dark ? "dark" : "");
}

await shot("/", "home");
await shot("/ielts", "ielts");
await shot("/cambridge", "cambridge");
await shot("/business-english", "business-english");
await shot("/general-english", "general-english");
await shot("/fluency-track", "fluency-track");
await shot("/fluency-passport", "fluency-passport");
await shot("/dashboard", "dashboard");
await shot("/", "home", { dark: true });
await shot("/dashboard", "dashboard", { dark: true });
await shot("/", "home", { mobile: true });
await shot("/dashboard", "dashboard", { mobile: true });

await browser.close();
console.log("DONE");
