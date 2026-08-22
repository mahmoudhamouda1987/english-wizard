const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const email = `probe-${Date.now()}@example.com`;
  const reg = await page.request.post("http://127.0.0.1:3000/api/auth/register", {
    data: { email, displayName: "Probe", password: "StrongPass123!" },
  });
  console.log("register:", reg.status());
  await page.goto("http://127.0.0.1:3000/dashboard", { waitUntil: "networkidle" });
  await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
  const results = await page.evaluate(() => window.axe.run(document, { tags: ["wcag2a", "wcag2aa"] }));
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const out = serious.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.slice(0, 12).map((n) => ({
      target: n.target.join(" > "),
      summary: n.failureSummary ? n.failureSummary.split("\n")[0] : "",
      html: n.html.slice(0, 160),
      data: JSON.stringify(n.any.map((a) => a.data)).slice(0, 300),
    })),
    totalNodes: v.nodes.length,
  }));
  fs.writeFileSync(process.env.TEMP + "\\opencode\\axe-detail.json", JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out.map((o) => ({ id: o.id, totalNodes: o.totalNodes })), null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
