"use client";

import { useState } from "react";

const TASKS = [
  { id: "w-prea1-form", title: "Fill in a form", prompt: "Write your name, country, and one thing you like. Three short lines.", level: "Pre-A1" },
  { id: "w-prea1-list", title: "Make a shopping list", prompt: "Write five foods you need from the shop.", level: "Pre-A1" },
  { id: "w-email", title: "Write a short email", prompt: "Apologise to a colleague for missing a meeting and suggest a new time.", level: "A2" },
  { id: "w-a1-intro", title: "Introduce yourself", prompt: "Write 3–4 sentences about yourself: name, city, family or job, one hobby.", level: "A1" },
  { id: "w-a1-invite", title: "Send an invitation", prompt: "Invite a friend to your birthday. Say the day, the place, and the time.", level: "A1" },
  { id: "w-a2-complaint", title: "Polite complaint", prompt: "Your hotel room had a problem. Write 4–5 sentences to the hotel explaining the issue and what you want.", level: "A2" },
  { id: "w-a2-review", title: "Write a review", prompt: "Review a café or restaurant you know: food, service, price. 4–5 sentences.", level: "A2" },
  { id: "w-opinion", title: "Give your opinion", prompt: "Some people think remote work is better. Write 4-5 sentences giving your view with reasons.", level: "B1" },
  { id: "w-b1-story", title: "Tell a story", prompt: "Write about a time something went wrong but ended well. Use past tenses and at least two time connectors (first, then, finally).", level: "B1" },
  { id: "w-report", title: "Describe a trend", prompt: "Describe how technology changed daily life in your country. Use at least two linking words.", level: "B2" },
  { id: "w-b2-argument", title: "Balanced argument", prompt: "'Cities should ban private cars from their centres.' Present both sides in 6–8 sentences, then give your conclusion.", level: "B2" },
  { id: "w-c1-proposal", title: "Write a proposal", prompt: "Propose one improvement to your workplace or university. Problem → solution → expected benefit, in formal register (8–10 sentences).", level: "C1" },
  { id: "w-c1-critique", title: "Critical response", prompt: "Respond to this claim in 8–10 sentences: 'AI will improve education more than it harms it.' Acknowledge the strongest counter-argument.", level: "C1" },
  { id: "w-c2-editorial", title: "Editorial voice", prompt: "Write an opinion column opening (10–12 sentences) on a current issue in your field. Control tone precisely: authoritative but not aggressive.", level: "C2" },
];

export default function WritingPage() {
  const [taskId, setTaskId] = useState(TASKS[0].id);
  const task = TASKS.find((t) => t.id === taskId) ?? TASKS[0];
  const [text, setText] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length;
  const strength = Math.min(100, Math.round(Math.min(words / 40, 1) * 70 + Math.min(sentences / 3, 1) * 30));

  async function submit() {
    if (text.trim().length < 20) return;
    setState("saving");
    try {
      const response = await fetch("/api/practice/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ skill: "writing", objectiveId: `writing:${task.id}`, correct: strength >= 70, lessonId: task.id, evidenceId: `writing-${task.id}-${crypto.randomUUID()}`, prompt: task.prompt, answer: text }),
      });
      setState(response.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <main id="main-content" style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>
      <p className="eyebrow">Writing</p>
      <h1>Build real writing skill</h1>
      <p style={{ marginTop: 8, opacity: .75 }}>Choose a task, write your response, and it becomes part of your learning evidence.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
        {TASKS.map((t) => (
          <button key={t.id} className={t.id === taskId ? "button" : "button secondary"} onClick={() => { setTaskId(t.id); setText(""); setState("idle"); }}>
            {t.title} · {t.level}
          </button>
        ))}
      </div>
      <section className="panel" style={{ marginTop: 18 }}>
        <h2>{task.title}</h2>
        <p>{task.prompt}</p>
        <textarea aria-label="Your writing response" rows={9} value={text} onChange={(e) => { setText(e.target.value.slice(0, 4000)); setState("idle"); }} placeholder="Write here…" style={{ width: "100%", marginTop: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 12 }}>
          <small className="subtle">{words} words · {sentences} sentences · evidence strength {strength}%</small>
          <button className="button" disabled={text.trim().length < 20 || state === "saving"} onClick={() => void submit()}>
            {state === "saving" ? "Saving…" : state === "saved" ? "✓ Saved as evidence" : "Submit writing"}
          </button>
        </div>
        {state === "saved" && <p className="subtle" style={{ marginTop: 10 }}>Your writing is now part of your learner model. Aim for 70%+ strength.</p>}
        {state === "error" && <p role="alert" style={{ marginTop: 10 }}>Could not save right now — try again.</p>}
      </section>
    </main>
  );
}
