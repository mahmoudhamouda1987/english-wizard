import { describe, expect, it } from 'vitest';
import { buildRetryDelay, gracefulFailure, normaliseLocale, shouldRetry } from './reliability-and-global';

describe('reliability and global policies', () => {
  it('uses bounded exponential retry delays', () => {
    expect(buildRetryDelay({ maxAttempts: 4, baseDelayMs: 100, maxDelayMs: 1000, retryableStatuses: [429, 502, 503, 504] }, 4)).toBe(800);
  });
  it('stops retrying after max attempts', () => {
    expect(shouldRetry(503, { maxAttempts: 3, baseDelayMs: 100, maxDelayMs: 1000, retryableStatuses: [503] }, 3)).toBe(false);
  });
  it('preserves learner work on graceful provider failure', () => {
    expect(gracefulFailure('Speech analysis')).toEqual({ feature: 'Speech analysis', saved: true, message: 'Speech analysis is temporarily unavailable. Your work has been saved. Please retry.', retryAllowed: true });
  });
  it('normalises international defaults without hard-coding a learner country', () => {
    expect(normaliseLocale({})).toEqual({ language: 'en', timezone: 'UTC', currency: 'USD', dateLocale: 'en-GB', englishVariety: 'BRITISH' });
  });
});
