/* Visual QA (Part 39): screenshots of the new flows at desktop/tablet/mobile. */
import { chromium } from "@playwright/test";

const BASE = "http://127.0.0.1:3000";
const WIDTHS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const browser = await chromium.launch();
const email = `vqa-${Date.now()}@example.com`;

// One authenticated learner per run.
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.request.post(`${BASE}/api/auth/register`, { data: { email, displayName: "Visual QA", password: "StrongPass123!" } });

async function shot(name) {
  for (const w of WIDTHS) {
    const p = await ctx.newPage();
    await p.setViewportSize({ width: w.width, height: w.height });
    await p.goto(`${BASE}${name.path}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await p.screenshot({ path: `/tmp/vqa/${name.file}-${w.name}.png`, fullPage: w.full !== false });
    await p.close();
  }
  console.log("done:", name.file);
}

import { mkdirSync } from "node:fs";
mkdirSync("/tmp/vqa", { recursive: true });

// 1. Onboarding screens (welcome → all 5 story screens)
for (const w of [WIDTHS[0], WIDTHS[2]]) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: w.width, height: w.height });
  for (let step = 0; step < 5; step++) {
    await p.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" });
    await p.waitForTimeout(500);
    for (let k = 0; k < step; k++) await p.click(".ob-cta");
    await p.waitForTimeout(900);
    await p.screenshot({ path: `/tmp/vqa/onboarding-s${step + 1}-${w.name}.png` });
  }
  // setup form (4 clicks reach screen 5; its CTA opens the setup form)
  for (let k = 0; k < 5; k++) {
    if (await p.locator(".ob-cta").count()) await p.click(".ob-cta");
    else break;
  }
  await p.waitForTimeout(500);
  await p.screenshot({ path: `/tmp/vqa/onboarding-setup-${w.name}.png`, fullPage: true });
  await p.close();
}
console.log("done: onboarding");

// 2. Diagnostic: start screen
await shot({ path: "/diagnostic", file: "diagnostic-start", full: false });

// 3. Start the assessment in-page, answer two MCQs, screenshot the view + navigator.
const p2 = await ctx.newPage();
await p2.setViewportSize({ width: 1440, height: 900 });
await p2.goto(`${BASE}/diagnostic`, { waitUntil: "networkidle" });
await p2.getByRole("button", { name: /Start LevelQuest/ }).click();
await p2.waitForTimeout(800);
await p2.screenshot({ path: "/tmp/vqa/diagnostic-assess-desktop.png" });
// open navigator
await p2.getByRole("button", { name: "Navigator" }).click();
await p2.waitForTimeout(400);
await p2.screenshot({ path: "/tmp/vqa/diagnostic-nav-desktop.png" });
// answer the first question if it's an MCQ
const opts = p2.locator(".panel button:has(span)");
if (await opts.count()) {
  await opts.first().click();
  await p2.waitForTimeout(900);
  await p2.screenshot({ path: "/tmp/vqa/diagnostic-answered-desktop.png" });
}
// mobile assessment
await p2.setViewportSize({ width: 390, height: 844 });
await p2.waitForTimeout(500);
await p2.screenshot({ path: "/tmp/vqa/diagnostic-assess-mobile.png" });
await p2.close();
console.log("done: diagnostic");

// 4. Finalize via API and capture report page + dashboard + plan + pricing.
const session = await (await page.request.get(`${BASE}/api/levelquest`)).json();
for (const item of session.paper) {
  await page.request.post(`${BASE}/api/levelquest`, {
    data: { sessionId: session.sessionId, itemId: item.id, answer: item.options?.[0] ?? "I practice English every day because it helps my career and my confidence." },
  });
}
const fin = await (await page.request.post(`${BASE}/api/levelquest`, { data: { sessionId: session.sessionId, finalize: true } })).json();
console.log("finalized level:", fin.result?.level);
await shot({ path: "/report", file: "report" });
await shot({ path: "/dashboard", file: "dashboard" });
await shot({ path: "/plan", file: "plan" });
await shot({ path: "/pricing", file: "pricing" });

await browser.close();
console.log("VISUAL QA COMPLETE");
