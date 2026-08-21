import { test, expect } from "@playwright/test";

test("authenticated language network exposes level-appropriate chunks and communication capabilities", async ({ request }) => {
  const email = `network-${Date.now()}@example.com`;
  const registered = await request.post("/api/auth/register", { data: { email, displayName: "Network Learner", password: "StrongPass123!" } });
  expect(registered.ok()).toBeTruthy();
  const response = await request.get("/api/language-network?level=B2");
  expect(response.ok()).toBeTruthy();
  const payload = await response.json();
  expect(payload.level).toBe("B2");
  expect(payload.chunks.some((item: { text: string }) => item.text === "From my perspective ...")).toBe(true);
  expect(payload.communicationCapabilities.some((item: { function: string }) => item.function === "PERSUADE")).toBe(true);
});
