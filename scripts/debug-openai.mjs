const key = process.env.OPENAI_API_KEY;
const models = await fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${key}` } });
console.log("models status:", models.status);
if (models.ok) {
  const list = (await models.json()).data.map((m) => m.id).filter((id) => id.includes("gpt")).sort();
  console.log(list.join("\n"));
} else {
  console.log((await models.text()).slice(0, 400));
}
const resp = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
  body: JSON.stringify({ model: "gpt-5.6", input: "Say OK." }),
});
console.log("\nresponses gpt-5.6:", resp.status, (await resp.text()).slice(0, 300));
