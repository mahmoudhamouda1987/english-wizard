/** Shared text-to-speech with British voice preference across the whole platform. */

type Lang = "en-GB" | "ar-SA";

let cachedVoices: SpeechSynthesisVoice[] | null = null;

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  if (!cachedVoices || cachedVoices.length === 0) cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => { cachedVoices = window.speechSynthesis.getVoices(); };
}

function pickVoice(lang: Lang): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;
  if (lang === "ar-SA") {
    return voices.find((v) => v.lang?.toLowerCase().startsWith("ar")) ?? null;
  }
  const british =
    voices.find((v) => v.lang?.toLowerCase() === "en-gb") ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("en-gb")) ??
    voices.find((v) => /british|uk english|\buk\b|daniel|sonia|kate|serena|oliver/i.test(v.name) && v.lang?.toLowerCase().startsWith("en"));
  return british ?? voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ?? null;
}

export function speakText(
  text: string,
  options: { lang?: Lang; rate?: number; pitch?: number; volume?: number; onStart?: () => void; onEnd?: () => void } = {},
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const lang = options.lang ?? "en-GB";
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voice = pickVoice(lang);
  if (voice) utterance.voice = voice;
  if (options.rate !== undefined) utterance.rate = options.rate;
  if (options.pitch !== undefined) utterance.pitch = options.pitch;
  if (options.volume !== undefined) utterance.volume = options.volume;
  if (options.onStart) utterance.onstart = () => options.onStart!();
  if (options.onEnd) utterance.onend = () => options.onEnd!();
  window.speechSynthesis.speak(utterance);
}

/** Speech-recognition locale for learner input: British English. */
export const RECOGNITION_LANG = "en-GB";

/**
 * Converts display notation into speakable text: linking underscores
 * (an_hour → an hour) and narrow IPA vowels that TTS engines mispronounce.
 */
export function speechFriendly(text: string): string {
  return text.replace(/_/g, " ").replace(/ɪ/g, "i").replace(/ə/g, "u");
}
