export type ProviderCapability = "LLM" | "TRANSCRIPTION" | "TTS" | "PRONUNCIATION" | "EMBEDDINGS";

export interface ProviderError {
  code: "NOT_CONFIGURED" | "UNAVAILABLE" | "INVALID_INPUT" | "RATE_LIMITED" | "PROVIDER_ERROR";
  message: string;
  retryable: boolean;
}

export type ProviderResult<T> = { ok: true; value: T; provider: string } | { ok: false; error: ProviderError; provider: string };

export interface LLMProvider {
  readonly provider: string;
  readonly capabilities: readonly ProviderCapability[];
  generate(input: { system: string; user: string; model: string; timeoutMs: number }): Promise<ProviderResult<{ text: string; usageTokens?: number }>>;
}

export interface TranscriptionProvider {
  readonly provider: string;
  readonly capabilities: readonly ProviderCapability[];
  transcribe(input: { audio: ArrayBuffer; language?: string }): Promise<ProviderResult<{ text: string }>>;
}

export interface TTSProvider {
  readonly provider: string;
  readonly capabilities: readonly ProviderCapability[];
  synthesize(input: { text: string; voice?: string; language?: string }): Promise<ProviderResult<{ audio: Uint8Array; contentType: string }>>;
}

export interface PronunciationProvider {
  readonly provider: string;
  readonly capabilities: readonly ProviderCapability[];
  assess(input: { audio: ArrayBuffer; referenceText?: string }): Promise<ProviderResult<{ score: number; risks: string[] }>>;
}

export interface EmbeddingsProvider {
  readonly provider: string;
  readonly capabilities: readonly ProviderCapability[];
  embed(input: { texts: string[] }): Promise<ProviderResult<{ vectors: number[][] }>>;
}

export function unavailableProvider(capability: ProviderCapability, message?: string): ProviderResult<never> {
  return {
    ok: false,
    provider: "unconfigured",
    error: {
      code: "NOT_CONFIGURED",
      message: message ?? `${capability} provider is not configured.`,
      retryable: false,
    },
  };
}

export function isProviderCapabilitySupported(capabilities: readonly ProviderCapability[], capability: ProviderCapability): boolean {
  return capabilities.includes(capability);
}
