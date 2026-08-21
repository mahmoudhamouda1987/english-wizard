import { describe, expect, it } from 'vitest';
import { canAccessTier, isActiveSubscription } from './billing';
import { defaultLearnerLocale, formatCurrency, normaliseDateLocale } from './localization';

describe('billing and localisation', () => {
  it('keeps billing vendor-independent and tier-aware', () => {
    expect(canAccessTier('PREMIUM', 'FREE')).toBe(true);
    expect(canAccessTier('FREE', 'PREMIUM')).toBe(false);
    expect(isActiveSubscription({ learnerId: 'l1', tier: 'PREMIUM', status: 'ACTIVE', provider: 'generic' })).toBe(true);
  });
  it('supports international locale defaults', () => {
    expect(normaliseDateLocale('ar')).toBe('ar-EG');
    expect(formatCurrency(1999, 'USD')).toContain('$19.99');
    expect(defaultLearnerLocale().englishVariety).toBe('BRITISH');
  });
});
