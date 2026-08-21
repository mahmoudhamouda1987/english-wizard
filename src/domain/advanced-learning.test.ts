import { describe, expect, it } from 'vitest';
import { buildHelpResponse, buildInterestProfile, buildSayItBetter, buildSession, buildThinkingStep, buildTransferTask } from './advanced-learning';

describe('advanced learning systems', () => {
  it('builds each session type around a measurable learning outcome', () => {
    const session = buildSession('BOSS_MISSION', 'boss-c1', ['read', 'speak', 'write']);
    expect(session.type).toBe('BOSS_MISSION');
    expect(session.minutes).toBe(35);
    expect(session.successMeasure).toContain('transfer');
  });

  it('keeps Say-It-Better stages distinct and creates retry/transfer', () => {
    const result = buildSayItBetter('I want make it better.', 'I want to make it better.', 'I want to improve it.', 'I would like to improve the result.', 'I would like to enhance the outcome.', 'Use the infinitive after want.', ['grammar']);
    expect(result.stages.LEARNER).not.toBe(result.stages.PROFESSIONAL);
    expect(result.retryPrompt).toContain('Rewrite');
    expect(result.transferPrompt).toContain('different');
  });

  it('creates a universal help response instead of a generic failure', () => {
    const result = buildHelpResponse({ capabilityId: 'past-simple', learnerMessage: "I don't understand", observedError: 'used present tense' });
    expect(result.diagnosis).toContain('past-simple');
    expect(result.checkQuestion).toContain('new example');
  });

  it('ranks interests by recency and weight and suggests broadening', () => {
    const profile = buildInterestProfile([
      { topic: 'technology', weight: 10, source: 'EXPLICIT_PREFERENCE', lastObservedAt: new Date().toISOString() },
      { topic: 'travel', weight: 4, source: 'CHOICE', lastObservedAt: new Date().toISOString() },
      { topic: 'history', weight: 1, source: 'TIME_SPENT', lastObservedAt: new Date().toISOString() }
    ]);
    expect(profile.preferred[0].topic).toBe('technology');
    expect(profile.preferred.length).toBeGreaterThan(0);
  });

  it('moves thinking-in-English from simple to advanced stages', () => {
    expect(buildThinkingStep('PRE_A1').stage).toBe('LABEL');
    expect(buildThinkingStep('B2').stage).toBe('REASON');
    expect(buildThinkingStep('C2').stage).toBe('IMPROVISE');
  });

  it('creates unfamiliar-context transfer tasks with independent-production criteria', () => {
    const task = buildTransferTask('B1', 'asking-for-help', 'asking at a shop', 'asking a colleague for technical help');
    expect(task.unfamiliarContext).toContain('technical');
    expect(task.successCriteria).toContain('Learner produces independently.');
  });
});
