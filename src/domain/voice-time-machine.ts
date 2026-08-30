import type { CEFRLevel } from "./learner";

/**
 * VOICE TIME MACHINE — band-calibrated calibration phrases (Part 100).
 * Five meaningful phrases per CEFR band, ordered by difficulty within the band.
 * Pronunciation targets in `focus` follow UK (RP) phonetics.
 */
export interface VtmPrompt { id: string; level: CEFRLevel; phrase: string; focus: string; }

export const VTM_PROMPTS: VtmPrompt[] = [
  // Pre-A1 — 1–3 words or fixed chunks a beginner can memorise whole.
  { id: "vtm-prea1-thank-you", level: "Pre-A1", phrase: "Thank you", focus: "th sound" },
  { id: "vtm-prea1-good-morning", level: "Pre-A1", phrase: "Good morning", focus: "word stress" },
  { id: "vtm-prea1-excuse-me", level: "Pre-A1", phrase: "Excuse me", focus: "k sound in “excuse”" },
  { id: "vtm-prea1-im-sorry", level: "Pre-A1", phrase: "I'm sorry", focus: "short o sound in “sorry”" },
  { id: "vtm-prea1-no-thank-you", level: "Pre-A1", phrase: "No, thank you", focus: "intonation: polite refusal" },
  // A1 — short everyday sentences built from memorised patterns.
  { id: "vtm-a1-my-name", level: "A1", phrase: "My name is Ana and I am from Spain.", focus: "sentence rhythm" },
  { id: "vtm-a1-tea-coffee", level: "A1", phrase: "I like tea, but I don't like coffee.", focus: "the “i-e” sound in “like”" },
  { id: "vtm-a1-bus", level: "A1", phrase: "The bus comes at half past eight.", focus: "th sound in “the”" },
  { id: "vtm-a1-window", level: "A1", phrase: "Can I open the window, please?", focus: "intonation: polite request" },
  { id: "vtm-a1-shop", level: "A1", phrase: "She works in a small shop near my house.", focus: "the s ending on “works”" },
  // A2 — everyday sentences with one clearly targeted tricky sound.
  { id: "vtm-a2-usually", level: "A2", phrase: "I usually have lunch at about one o'clock.", focus: "the s sound in “usually”" },
  { id: "vtm-a2-film", level: "A2", phrase: "It was a very good film, wasn't it?", focus: "v and w sounds" },
  { id: "vtm-a2-wednesday", level: "A2", phrase: "I worked on Wednesday and walked home in the rain.", focus: "silent letters: Wednesday" },
  { id: "vtm-a2-shirt-skirt", level: "A2", phrase: "She's wearing a purple shirt and a grey skirt.", focus: "sh and sk sounds: shirt, skirt" },
  { id: "vtm-a2-water", level: "A2", phrase: "Would you like some water or a soft drink?", focus: "the “aw” sound in “water”" },
  // B1 — opinion sentences; stress and polite hedges carry the meaning.
  { id: "vtm-b1-opinion-remote", level: "B1", phrase: "In my opinion, remote work saves time but makes teamwork harder.", focus: "sentence stress" },
  { id: "vtm-b1-id-say", level: "B1", phrase: "I'd say learning a language is easier when you use it every day.", focus: "contracted “I'd”" },
  { id: "vtm-b1-honestly", level: "B1", phrase: "Honestly, I don't think prices will come down this year.", focus: "word stress: honestly" },
  { id: "vtm-b1-should", level: "B1", phrase: "As far as I'm concerned, dogs should be allowed in parks.", focus: "silent l in “should”" },
  { id: "vtm-b1-seems", level: "B1", phrase: "It seems to me that shopping online saves both time and money.", focus: "s and sh sounds" },
  // B2 — workplace sentences where linking makes the difference.
  { id: "vtm-b2-follow-up", level: "B2", phrase: "I'll follow up with the client as soon as the figures are in.", focus: "linking: I'll follow up" },
  { id: "vtm-b2-gonna", level: "B2", phrase: "We're going to need more time on this one, to be honest.", focus: "connected speech: gonna" },
  { id: "vtm-b2-end-of-day", level: "B2", phrase: "Could you get back to me by the end of the day?", focus: "weak forms: end of the day" },
  { id: "vtm-b2-pick-it-up", level: "B2", phrase: "Let's touch base on Monday and pick it up from there.", focus: "linking: pick it up" },
  { id: "vtm-b2-add-up", level: "B2", phrase: "The numbers don't quite add up, so let's double-check the totals.", focus: "linking: quite add up" },
  // C1 — complex sentences across registers; control rhythm and weak forms.
  { id: "vtm-c1-scoped", level: "C1", phrase: "While I appreciate the urgency, I'd rather we scoped this properly before committing to a date.", focus: "sentence rhythm across clauses" },
  { id: "vtm-c1-notwithstanding", level: "C1", phrase: "Notwithstanding the caveats, the evidence points firmly towards early intervention.", focus: "word stress: notwithstanding" },
  { id: "vtm-c1-reframe", level: "C1", phrase: "I wonder whether we might reframe the question altogether.", focus: "intonation: tentative suggestion" },
  { id: "vtm-c1-bluntly", level: "C1", phrase: "To put it bluntly, the original estimate was never realistic.", focus: "linking: put it bluntly" },
  { id: "vtm-c1-had-we-known", level: "C1", phrase: "Had we known about the delays earlier, we would have phased the rollout differently.", focus: "weak forms: would have" },
  // C2 — idiom and nuance challenges; precision under natural speed.
  { id: "vtm-c2-neither", level: "C2", phrase: "That proposal is neither here nor there, frankly.", focus: "voiced th sound: neither" },
  { id: "vtm-c2-woods", level: "C2", phrase: "We're not out of the woods yet, but the trend is encouraging.", focus: "linking: out of the woods" },
  { id: "vtm-c2-white-elephant", level: "C2", phrase: "It's a bit of a white elephant, if you ask me.", focus: "connected speech: a bit of a" },
  { id: "vtm-c2-room", level: "C2", phrase: "The elephant in the room is pricing, and everyone politely ignores it.", focus: "the f sound in “elephant”" },
  { id: "vtm-c2-point", level: "C2", phrase: "Up to a point, the sceptics were right; beyond it, they were simply cautious.", focus: "intonation: up to a point" },
];

/** The five calibration phrases for one CEFR band, in presentation order. */
export function promptsForLevel(level: CEFRLevel): VtmPrompt[] {
  return VTM_PROMPTS.filter((p) => p.level === level);
}
