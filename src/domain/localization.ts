import type { EnglishVariety, LanguageCode } from './reliability-and-global';
export interface Translation { key: string; locale: LanguageCode; value: string; }
export interface LearnerLocalePreferences { uiLanguage: LanguageCode; timezone: string; currency: string; englishVariety: EnglishVariety; }
export function formatCurrency(amountMinor: number, currency: string, locale = 'en-GB'): string { return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amountMinor / 100); }
export function normaliseDateLocale(locale: LanguageCode): string { const map: Record<LanguageCode, string> = { en: 'en-GB', ar: 'ar-EG', fr: 'fr-FR', es: 'es-ES', de: 'de-DE', tr: 'tr-TR', zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-PT' }; return map[locale] ?? 'en-GB'; }
export function defaultLearnerLocale(): LearnerLocalePreferences { return { uiLanguage: 'en', timezone: 'UTC', currency: 'USD', englishVariety: 'BRITISH' }; }
