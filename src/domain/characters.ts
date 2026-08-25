/**
 * Recurring character universe. The same people grow alongside the learner:
 * a university student at A2 reappears as a graduate at B1, an employee at B2
 * and a manager at C1 — making the platform feel like a world, not a textbook.
 */
export type CharacterGender = "male" | "female";

export interface CharacterProfile {
  id: string;
  name: string;
  emoji: string;
  gender: CharacterGender;
  ageBand: "teens" | "20s" | "30s" | "40s" | "50s+";
  occupation: string;
  personality: string;
  background: string;
  goal: string;
  style: string;
}

export const CHARACTER_UNIVERSE: CharacterProfile[] = [
  { id: "omar", gender: "male", name: "Omar", emoji: "🧑", ageBand: "20s", occupation: "engineering student, later junior engineer", personality: "curious, slightly anxious, over-prepares", background: "moved abroad for university; calls home every Sunday", goal: "graduate, land a real engineering job", style: "polite questions, double-checks details" },
  { id: "grace", gender: "female", name: "Grace", emoji: "👵", ageBand: "50s+", occupation: "retired nurse, community volunteer", personality: "warm, blunt in a caring way, tells stories", background: "forty years in hospitals; knows everyone on her street", goal: "keep the neighbourhood connected", style: "short warm sentences, sudden direct advice" },
  { id: "lina", gender: "female", name: "Lina", emoji: "👩", ageBand: "30s", occupation: "pharmacist", personality: "calm, precise, dry humour", background: "runs the local pharmacy; trained in two countries", goal: "open her own clinic-pharmacy hybrid", style: "clear instructions, gentle corrections" },
  { id: "tom", gender: "male", name: "Tom", emoji: "🧑", ageBand: "teens", occupation: "sixth-form student", personality: "energetic, easily bored, loyal friend", background: "grew up on the same street as Grace", goal: "pass exams, make the football team", style: "slangy, interrupts when excited" },
  { id: "yusuf", gender: "male", name: "Yusuf", emoji: "👨", ageBand: "40s", occupation: "restaurant owner", personality: "proud, generous, perfectionist about food", background: "family restaurant for twenty years; recipes from his mother", goal: "expand without losing quality", style: "hospitality first, business second" },
  { id: "priya", gender: "female", name: "Priya", emoji: "👩‍💼", ageBand: "30s", occupation: "product manager", personality: "organised, diplomatic, quietly ambitious", background: "started in support; worked up to product", goal: "lead her own team next year", style: "structured, summarises often" },
  { id: "samir", gender: "male", name: "Samir", emoji: "🧔", ageBand: "50s+", occupation: "bank branch manager", personality: "formal, cautious, secretly sentimental", background: "thirty years in banking; seen every scam twice", goal: "protect customers' money and his pension", style: "measured phrases, hedged statements" },
  { id: "hana", gender: "female", name: "Hana", emoji: "👩‍🔬", ageBand: "20s", occupation: "research assistant", personality: "precise, sceptical, enthusiastic about data", background: "master's student publishing her first paper", goal: "a PhD position abroad", style: "evidence-first, asks why repeatedly" },
  { id: "dan", gender: "male", name: "Dan", emoji: "🧑‍🍳", ageBand: "30s", occupation: "chef de partie", personality: "intense under pressure, kind off-shift", background: "kitchen since sixteen; worked in three countries", goal: "his own small bistro", style: "clipped kitchen English, warms up slowly" },
  { id: "rana", gender: "female", name: "Rana", emoji: "👩‍⚕️", ageBand: "40s", occupation: "GP (family doctor)", personality: "patient, thorough, reassuring", background: "immigrated as a young doctor; rebuilt her credentials", goal: "mentor overseas-trained doctors", style: "plain-language medical explanations" },
  { id: "jack", gender: "male", name: "Jack", emoji: "👷", ageBand: "30s", occupation: "site foreman", personality: "practical, teasing, safety-obsessed", background: "left school early; runs the best site in the county", goal: "start his own contracting firm", style: "direct, idiomatic, numbers-driven" },
  { id: "maya", gender: "female", name: "Maya", emoji: "👩‍💻", ageBand: "20s", occupation: "freelance developer", personality: "independent, ironic, deadline-honest", background: "went remote during uni and never went back", goal: "build a sustainable freelance studio", style: "casual written English, precise scope talk" },
  { id: "adam", gender: "male", name: "Adam", emoji: "🧑‍💼", ageBand: "40s", occupation: "sales director", personality: "charming, competitive, surprisingly reflective", background: "twenty years of quotas and quarterly reviews", goal: "move into strategy before burnout finds him", style: "persuasive framing, sports metaphors" },
  { id: "chloe", gender: "female", name: "Chloe", emoji: "👩‍🏫", ageBand: "30s", occupation: "ESOL teacher", personality: "encouraging, observant, endlessly patient", background: "taught in four countries; collects learner errors like stamps", goal: "write a book on teaching adults", style: "models correct forms inside conversation" },
  { id: "tariq", gender: "male", name: "Tariq", emoji: "👨‍🔧", ageBand: "50s+", occupation: "train driver", personality: "stoic, punctual, quietly proud", background: "thirty years on the rails; remembers every timetable change", goal: "a clean retirement and a fishing boat", style: "minimal words, maximal reliability" },
  { id: "sofia", gender: "female", name: "Sofia", emoji: "👩‍🎨", ageBand: "20s", occupation: "graphic design graduate, job-hunting", personality: "creative, self-critical, resilient", background: "graduated into a tough market; keeps a sketchbook habit", goal: "first real design role", style: "thoughtful hesitations, vivid descriptions" },
];

function h32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Two distinct universe members for a given context key — stable per lesson/scene. */
export function castFor(key: string): Array<{ profile: CharacterProfile }> {
  const pool = [...CHARACTER_UNIVERSE];
  const picked: CharacterProfile[] = [];
  let seed = h32(key);
  while (picked.length < 2 && pool.length > 0) {
    seed = h32(String(seed) + key);
    picked.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return picked.map((profile) => ({ profile }));
}

/** A one-line memory note so scenes can reference a character's continuity. */
export function continuityLine(profile: CharacterProfile): string {
  return `${profile.name} (${profile.ageBand}, ${profile.occupation}) — ${profile.personality}. Wants: ${profile.goal}.`;
}


/** Resolves a scene character's declared gender from the canonical registry. */
export function characterByName(name: string): CharacterProfile | null {
  const needle = name.trim().toLowerCase();
  return CHARACTER_UNIVERSE.find((profile) => profile.name.toLowerCase() === needle) ?? null;
}

export function genderForName(name: string): CharacterGender | undefined {
  return characterByName(name)?.gender;
}
