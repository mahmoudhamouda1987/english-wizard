import { describe, expect, it } from 'vitest';
import { canPublishActivity, nextGenerationStage, validateActivity, type ActivitySpecification, type GeneratedActivityState } from './content-pipeline';

describe('content pipeline', () => {
  const spec: ActivitySpecification = { contentId: 'c1', objectiveId: 'a1', level: 'A1', skill: 'writing', difficulty: 35, expectedAnswer: 'work', acceptableAnswers: ['work'], source: 'original', rightsStatus: 'OWNED' };
  it('validates a publishable activity specification', () => expect(validateActivity(spec).passed).toBe(true));
  it('rejects content with review-pending rights', () => expect(validateActivity({ ...spec, rightsStatus: 'PENDING_REVIEW' }).passed).toBe(false));
  it('advances the pipeline only after validation passes', () => expect(nextGenerationStage('AUTOMATED_VALIDATION', true)).toBe('DIFFICULTY_VALIDATION'));
  it('requires quality review and all validators before publishing', () => {
    const state: GeneratedActivityState = { contentId: 'c1', stage: 'QUALITY_REVIEW', version: '1.0.0', updatedAt: new Date().toISOString(), validations: { safety: { passed: true, issues: [] }, answer: { passed: true, issues: [] } } };
    expect(canPublishActivity(state)).toBe(true);
  });
});
