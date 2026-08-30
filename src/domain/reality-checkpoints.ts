import type { CEFRLevel } from "./learner";

export interface RubricCriterion { id: string; label: string; hint: string }
export interface RealityCheckpoint {
  id: string;
  level: CEFRLevel;
  title: string;
  situation: string;
  task: string;
  skill: "speaking" | "writing";
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
  { id:"rc-prea1-market", level:"Pre-A1", title:"Buy two things at the market", situation:"You are at a market stall. You want two apples and some bread.", task:"Write exactly what you say to the seller: ask for the two things, then ask the price.", skill:"speaking", rubric:[
    { id:"items", label:"Asks for the two items", hint:"Two apples, please / Some bread, please" },
    { id:"price", label:"Asks the price", hint:"How much is it?" },
    { id:"polite", label:"Uses please or thank you", hint:"Politeness word present" } ] },
  { id:"rc-prea1-thanks", level:"Pre-A1", title:"Thank a friend in a message", situation:"Your friend cooked dinner for you last night.", task:"Write a two-line message: thank your friend, and say one thing that was very good.", skill:"writing", rubric:[
    { id:"thanks", label:"Says thank you", hint:"Thank you for the dinner" },
    { id:"detail", label:"Names one thing you liked", hint:"The soup was very good" },
    { id:"short", label:"Keeps it short and clear", hint:"Two lines, no more" } ] },
  { id:"rc-a1-directions", level:"A1", title:"Ask for simple directions", situation:"You are at the school reception, but you cannot find the train station.", task:"Write exactly what you say: ask where the station is, check how far it is, and thank the clerk.", skill:"speaking", rubric:[
    { id:"ask", label:"Asks for the place politely", hint:"Excuse me, where is the station?" },
    { id:"check", label:"Checks distance or direction", hint:"Is it far from here?" },
    { id:"thanks", label:"Thanks the person", hint:"Thank you very much" } ] },
  { id:"rc-a1-cancel", level:"A1", title:"Cancel a plan by text", situation:"You cannot meet your friend tomorrow because you are ill.", task:"Write a short text: say sorry, say why you cannot come, and suggest another day.", skill:"writing", rubric:[
    { id:"sorry", label:"Apologises simply", hint:"I am sorry" },
    { id:"reason", label:"Gives the reason", hint:"I am ill" },
    { id:"newplan", label:"Suggests another day", hint:"How about Friday?" } ] },
  { id:"rc-a2-return", level:"A2", title:"Return a broken item in a shop", situation:"You bought a phone charger here last week, but it has stopped working.", task:"Write exactly what you say to the shop assistant: explain the problem, say when you bought it, and ask for a replacement or refund.", skill:"speaking", rubric:[
    { id:"problem", label:"Explains the problem clearly", hint:"It has stopped working" },
    { id:"when", label:"Says when and where you bought it", hint:"I bought it here last week" },
    { id:"request", label:"Asks for replacement or refund", hint:"Can I have a replacement, please?" } ] },
  { id:"rc-b1-landlord", level:"B1", title:"Report a repair to your landlord", situation:"The kitchen tap in your flat has been dripping for a week.", task:"Write a short email to your landlord: describe the problem, explain how it affects you, and ask for a repair this week.", skill:"writing", rubric:[
    { id:"describe", label:"Describes the problem precisely", hint:"The tap has been dripping since…" },
    { id:"impact", label:"Explains the impact on you", hint:"Wasted water / cannot use the sink" },
    { id:"action", label:"Requests repair with a timescale", hint:"Could you arrange a repair this week?" } ] },
  { id:"rc-b2-question", level:"B2", title:"Handle a hard question after a talk", situation:"After your presentation, an audience member challenges one of your key figures.", task:"Write what you say: thank them, answer the challenge with evidence, and offer a follow-up afterwards.", skill:"speaking", rubric:[
    { id:"acknowledge", label:"Acknowledges the question professionally", hint:"That is a fair question" },
    { id:"evidence", label:"Answers with concrete evidence", hint:"Our figures come from…" },
    { id:"followup", label:"Offers a follow-up", hint:"I will send the full analysis after the session" } ] },
  { id:"rc-c1-mediate", level:"C1", title:"Mediate a disagreement between teams", situation:"Design and engineering disagree openly about an unrealistic deadline.", task:"Write what you say to both teams together: restate each side's position fairly, name the real constraint, and propose a path both can accept.", skill:"speaking", rubric:[
    { id:"fair", label:"Restates both positions fairly", hint:"Neither side dismissed" },
    { id:"constraint", label:"Names the underlying constraint", hint:"The real limit is…" },
    { id:"shared", label:"Frames the compromise as shared", hint:"What we both need is…" } ] },
  { id:"rc-c2-keynote", level:"C2", title:"Open a keynote with authority", situation:"You are opening an industry conference on a contested topic.", task:"Write your opening (6–8 sentences): a hook that reframes the debate, a precise thesis, and a roadmap of the argument — controlled register, no clichés.", skill:"writing", rubric:[
    { id:"hook", label:"Hook reframes rather than states the obvious", hint:"A fresh angle on the debate" },
    { id:"thesis", label:"Thesis is precise and qualified", hint:"Exact claim, proper scope" },
    { id:"roadmap", label:"Roadmap signals the structure", hint:"I will argue three points…" } ] },
  { id:"rc-c2-refusal", level:"C2", title:"Deliver a diplomatic refusal", situation:"A partner asks your organisation to endorse a report you have serious reservations about.", task:"Write exactly what you say: value the partnership, decline without ambiguity, and leave the door open on clear conditions.", skill:"speaking", rubric:[
    { id:"warmth", label:"Opens by valuing the partnership", hint:"Warm, but brief" },
    { id:"clarity", label:"Declines without hedging", hint:"We are not able to endorse…" },
    { id:"conditions", label:"Leaves a conditional door open", hint:"If the methodology is revised…" } ] },
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
