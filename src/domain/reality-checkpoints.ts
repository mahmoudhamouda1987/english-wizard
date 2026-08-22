import type { CEFRLevel } from "./learner";

export interface RubricCriterion { id: string; label: string; hint: string }
export interface RealityCheckpoint {
  id: string;
  level: CEFRLevel;
  title: string;
  situation: string;
  task: string;
  skill: string;
  rubric: RubricCriterion[];
}

export const REALITY_CHECKPOINTS: RealityCheckpoint[] = [
  { id:"rc-prea1-cafe", level:"Pre-A1", title:"Order breakfast for two", situation:"You are at a café with a friend on Saturday morning.", task:"Write exactly what you would say to the waiter: order two drinks and one food item, and ask the price.", skill:"speaking", rubric:[
    { id:"greet", label:"Opens with a greeting", hint:"Hello / Good morning" },
    { id:"order", label:"Orders two drinks and one food", hint:"Two teas and one cake, please" },
    { id:"polite", label:"Uses please or thank you", hint:"Politeness word present" } ] },
  { id:"rc-a1-introduce", level:"A1", title:"Introduce yourself to a new neighbour", situation:"Your new neighbour knocks on the door.", task:"Write what you say: greet them, give your name, say where you are from, and invite them for coffee.", skill:"speaking", rubric:[
    { id:"greet", label:"Greets warmly", hint:"Nice to meet you" },
    { id:"info", label:"Name + where from", hint:"Two facts about you" },
    { id:"invite", label:"Ends with an invitation", hint:"Would you like…" } ] },
  { id:"rc-a2-complaint", level:"A2", title:"Complain about a broken heater", situation:"Your hotel room heater is broken and it is freezing.", task:"Write the message you send to reception: explain the problem, say how it affects you, and ask for a fix or a new room.", skill:"writing", rubric:[
    { id:"problem", label:"States the problem clearly", hint:"The heater is not working" },
    { id:"effect", label:"Explains the impact", hint:"The room is very cold" },
    { id:"request", label:"Makes a specific request", hint:"Please fix it / change my room" } ] },
  { id:"rc-a2-voicemail", level:"A2", title:"Leave a voicemail for a friend", situation:"You arranged to meet but you will be 30 minutes late.", task:"Write your voicemail: who you are, why you are late, your new arrival time, and an apology.", skill:"speaking", rubric:[
    { id:"who", label:"Says who you are", hint:"It's Omar" },
    { id:"reason", label:"Gives reason + new time", hint:"Traffic… I'll be there at 4" },
    { id:"apology", label:"Apologises sincerely", hint:"Sorry / I apologise" } ] },
  { id:"rc-b1-meeting", level:"B1", title:"Disagree politely in a meeting", situation:"A colleague proposes a plan you believe is too expensive.", task:"Write what you would say: acknowledge their idea, raise your concern with a reason, and suggest an alternative.", skill:"speaking", rubric:[
    { id:"ack", label:"Acknowledges the idea first", hint:"That could work because…" },
    { id:"concern", label:"Raises concern with evidence", hint:"However, the budget…" },
    { id:"alternative", label:"Offers an alternative", hint:"What if we instead…" } ] },
  { id:"rc-b1-email-chase", level:"B1", title:"Chase a late reply by email", situation:"You sent an important email five days ago; no answer.", task:"Write a short follow-up email: reference the original, restate what you need, set a gentle deadline.", skill:"writing", rubric:[
    { id:"reference", label:"References the earlier message", hint:"Following my email of…" },
    { id:"clarity", label:"Restates the request clearly", hint:"I still need…" },
    { id:"deadline", label:"Sets a polite deadline", hint:"By Friday, if possible" } ] },
  { id:"rc-b2-negotiate", level:"B2", title:"Negotiate a delivery delay", situation:"Your supplier says a key order will be two weeks late.", task:"Write your reply: express the impact on your side, propose a compromise, and confirm next steps in writing.", skill:"writing", rubric:[
    { id:"impact", label:"Quantifies the impact", hint:"This delays our launch…" },
    { id:"compromise", label:"Proposes a workable compromise", hint:"Partial shipment…" },
    { id:"confirm", label:"Confirms follow-up action", hint:"I'll confirm by…" } ] },
  { id:"rc-b2-review-response", level:"B2", title:"Respond to a negative review", situation:"Your company received a harsh public online review.", task:"Draft the public response: thank them, acknowledge the specific issue without admitting fault blindly, and offer a resolution path.", skill:"writing", rubric:[
    { id:"thanks", label:"Opens professionally", hint:"Thank you for the feedback" },
    { id:"specific", label:"Addresses the specific issue", hint:"Names the actual problem" },
    { id:"resolution", label:"Moves it to a resolution channel", hint:"Contact us so we can fix it" } ] },
  { id:"rc-c1-exec-summary", level:"C1", title:"Brief an executive in five sentences", situation:"A project you lead hit a serious blocker this week.", task:"Write the update: what happened, business impact, options considered, recommendation, decision needed — five sentences maximum.", skill:"writing", rubric:[
    { id:"situation", label:"States event + impact crisply", hint:"No filler" },
    { id:"options", label:"Shows considered options", hint:"At least two" },
    { id:"ask", label:"Ends with a clear ask", hint:"Decision needed by…" } ] },
  { id:"rc-c1-pushback", level:"C1", title:"Push back on unrealistic scope", situation:"A client adds major features but won't move the deadline.", task:"Write your message: show understanding, explain the trade-off precisely (time/cost/quality), and present a scoped alternative.", skill:"writing", rubric:[
    { id:"empathy", label:"Demonstrates understanding of their goal", hint:"Their interest first" },
    { id:"tradeoff", label:"Names the trade-off explicitly", hint:"Time vs scope vs cost" },
    { id:"scoped", label:"Proposes scoped alternative", hint:"Phase 1 now, phase 2 after" } ] },
  { id:"rc-c2-crisis", level:"C2", title:"Statement during a public crisis", situation:"Your organisation faces public criticism over a data incident.", task:"Draft a 6–8 sentence statement: acknowledge, take proportionate responsibility, state remediation, rebuild trust — precise register throughout.", skill:"writing", rubric:[
    { id:"acknowledge", label:"Acknowledges without defensiveness", hint:"We understand the concern" },
    { id:"remediation", label:"Details concrete remediation", hint:"Specific actions taken" },
    { id:"trust", label:"Closes rebuilding trust", hint:"Forward-looking commitment" } ] },
];

/** Spaced scheduling: a fresh checkpoint every 3rd day, rotating within level, skipping recently completed ones. */
export function nextCheckpoint(level: CEFRLevel, completedIds: string[], now = new Date()): RealityCheckpoint | null {
  const pool = REALITY_CHECKPOINTS.filter((c) => c.level === level);
  const fallback = pool.length ? pool : REALITY_CHECKPOINTS;
  const day = Math.floor(now.getTime() / 86400000);
  const open = fallback.filter((c) => !completedIds.includes(c.id));
  if (open.length === 0) return null;
  if (day % 3 !== 0 && completedIds.length > 0) return null; // rest days between checkpoints
  return open[day % open.length];
}
