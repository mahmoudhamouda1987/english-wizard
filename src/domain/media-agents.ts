export interface MediaAgent {
  id: string;
  label: string;
  capability: "video" | "voice" | "image" | "music";
  envKey: string;
  configured: boolean;
  use: string;
}

/**
 * Registry of AI media providers that will power generated videos, voices and
 * images across every learning tab. Each agent activates automatically once its
 * API key is present in the environment — no code changes required.
 */
export function mediaAgentsStatus(): MediaAgent[] {
  const define = (
    id: string,
    label: string,
    capability: MediaAgent["capability"],
    envKey: string,
    use: string,
  ): MediaAgent => ({
    id,
    label,
    capability,
    envKey,
    configured: Boolean(process.env[envKey]),
    use,
  });

  return [
    define("artlist", "Artlist", "video", "ARTLIST_API_KEY", "Licensed cinematic clips for conversation scenes and world backdrops."),
    define("heygen", "HeyGen avatars", "video", "HEYGEN_API_KEY", "Photoreal talking-teacher avatar videos for lessons."),
    define("elevenlabs", "ElevenLabs", "voice", "ELEVENLABS_API_KEY", "Studio-grade character voices for dialogues and pronunciation."),
    define("openai-speech", "OpenAI speech", "voice", "OPENAI_API_KEY", "Narration and listening-lab audio generation."),
    define("openai-images", "OpenAI images", "image", "OPENAI_API_KEY", "Illustrated scene art for stories, reading and vocabulary cards."),
    define("suno", "Suno", "music", "SUNO_API_KEY", "Level-themed background music for focus sessions."),
    define("pexels", "Pexels stock", "video", "PEXELS_API_KEY", "Free real-world footage fallback for immersion scenes."),
  ];
}
