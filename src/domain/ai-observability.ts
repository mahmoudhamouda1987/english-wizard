export type AIResultClass = "SUCCESS" | "CONFIGURATION_ERROR" | "PROVIDER_ERROR" | "TIMEOUT" | "MALFORMED_RESPONSE" | "UNEXPECTED_ERROR";

export interface AICallEvidence {
  requestId: string;
  provider: "openai";
  model: string;
  operation: "lesson" | "speaking" | "writing" | "teacher_help" | "other";
  result: AIResultClass;
  latencyMs: number;
  createdAt: string;
  inputChars: number;
}

export function classifyAIStatus(status: number): AIResultClass {
  if (status === 401 || status === 403 || status === 429) return "PROVIDER_ERROR";
  if (status >= 500) return "PROVIDER_ERROR";
  return "UNEXPECTED_ERROR";
}

export function redactAIProviderDetail(_detail: string): undefined {
  void _detail;
  return undefined;
}
