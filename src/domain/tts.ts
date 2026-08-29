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

export type VoiceGender = "male" | "female";

const FEMALE_VOICE_HINT = /female|zira|hazel|libby|sonia|aria|jenny|michelle|kate|serena|martha|eva|susan|heera|emma(?!$)|clara|yvonne|tessa|maisie/i;
const MALE_VOICE_HINT = /male(?!.*female)|\bdavid\b|\bmark\b|\bryan\b|\bgeorge\b|thomas|\bguy\b|\bjames\b|richard|william|oliver|liam|arthur|rishi/i;

function pickVoice(lang: Lang, gender?: VoiceGender): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;
  if (lang === "ar-SA") {
    const arabic = voices.filter((v) => v.lang?.toLowerCase().startsWith("ar"));
    if (gender && arabic.length > 1) {
      const gendered = arabic.find((v) => gender === "female" ? FEMALE_VOICE_HINT.test(v.name) : MALE_VOICE_HINT.test(v.name));
      if (gendered) return gendered;
    }
    return arabic[0] ?? null;
  }
  const english =
    voices.filter((v) => v.lang?.toLowerCase() === "en-gb").length
      ? voices.filter((v) => v.lang?.toLowerCase() === "en-gb")
      : voices.filter((v) => v.lang?.toLowerCase().startsWith("en-gb")).length
        ? voices.filter((v) => v.lang?.toLowerCase().startsWith("en-gb"))
        : voices.filter((v) => v.lang?.toLowerCase().startsWith("en"));
  const pool = english.length ? english : voices;
  if (gender) {
    // Prefer an explicitly gendered British voice; fall back to any gendered English voice.
    const inPool = pool.find((v) => gender === "female" ? FEMALE_VOICE_HINT.test(v.name) : MALE_VOICE_HINT.test(v.name));
    if (inPool) return inPool;
    const anywhere = loadVoices().find((v) => v.lang?.toLowerCase().startsWith("en") && (gender === "female" ? FEMALE_VOICE_HINT.test(v.name) : MALE_VOICE_HINT.test(v.name)));
    if (anywhere) return anywhere;
  }
  const britishNamed = pool.find((v) => /british|uk english|\buk\b|daniel|sonia|kate|serena|oliver/i.test(v.name));
  return britishNamed ?? pool[0] ?? null;
}

/** Audible differentiation when the OS exposes only one voice per language. */
const GENDER_PITCH: Record<VoiceGender, number> = { male: 0.92, female: 1.14 };

export function speakText(
  text: string,
  options: { lang?: Lang; rate?: number; pitch?: number; volume?: number; gender?: VoiceGender; onStart?: () => void; onEnd?: () => void; onBoundary?: (charIndex: number) => void; onError?: () => void } = {},
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (options.onError) options.onError();
    return;
  }
  const lang = options.lang ?? "en-GB";
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  const voice = pickVoice(lang, options.gender);
  if (voice) utterance.voice = voice;
  if (options.rate !== undefined) utterance.rate = options.rate;
  if (options.pitch !== undefined) utterance.pitch = options.pitch;
  else if (options.gender) utterance.pitch = GENDER_PITCH[options.gender];
  if (options.volume !== undefined) utterance.volume = options.volume;
  if (options.onStart) utterance.onstart = () => options.onStart!();
  if (options.onEnd) utterance.onend = () => options.onEnd!();
  if (options.onBoundary) utterance.onboundary = (e) => options.onBoundary!(e.charIndex);
  if (options.onError) utterance.onerror = () => options.onError!();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
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
