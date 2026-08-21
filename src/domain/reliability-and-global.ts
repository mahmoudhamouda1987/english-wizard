export type LanguageCode = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'tr' | 'zh' | 'ja' | 'ko' | 'pt';
export type EnglishVariety = 'BRITISH' | 'AMERICAN' | 'AUSTRALIAN' | 'CANADIAN' | 'INTERNATIONAL';
export interface LocaleContext { language: LanguageCode; timezone: string; currency: string; dateLocale: string; englishVariety: EnglishVariety; }
export interface RetryPolicy { maxAttempts: number; baseDelayMs: number; maxDelayMs: number; retryableStatuses: number[]; }
export interface ProviderFallback { primary: string; fallback?: string; unavailableMessage: string; preserveUserWork: boolean; }
export interface FeatureFailure { feature: string; saved: boolean; message: string; retryAllowed: boolean; }

export function buildRetryDelay(policy: RetryPolicy, attempt: number): number { return Math.min(policy.maxDelayMs, policy.baseDelayMs * Math.pow(2, Math.max(0, attempt - 1))); }
export function shouldRetry(status: number, policy: RetryPolicy, attempt: number): boolean { return attempt < policy.maxAttempts && policy.retryableStatuses.includes(status); }
export function gracefulFailure(feature: string, preserveUserWork = true): FeatureFailure { return { feature, saved: preserveUserWork, message: `${feature} is temporarily unavailable. Your work has been saved. Please retry.` , retryAllowed: true }; }
export function normaliseLocale(input: Partial<LocaleContext>): LocaleContext { return { language: input.language ?? 'en', timezone: input.timezone ?? 'UTC', currency: input.currency ?? 'USD', dateLocale: input.dateLocale ?? 'en-GB', englishVariety: input.englishVariety ?? 'BRITISH' }; }
