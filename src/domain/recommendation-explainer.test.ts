import { describe, expect, it } from 'vitest';
import { explainRecommendation } from './recommendation-explainer';

describe('recommendation explainer', () => {
  it('returns evidence-backed human-readable reasons', () => {
    const result = explainRecommendation('lesson-2', 'lesson', [
      { type: 'ERROR', message: 'You repeatedly omit articles in writing', weight: 95 },
      { type: 'GOAL', message: 'Your goal is professional English', weight: 80 },
      { type: 'MASTERY_GAP', message: 'Production evidence is below target', weight: 90 },
      { type: 'RETENTION', message: 'This skill is due for review', weight: 50 },
    ]);
    expect(result.evidence).toHaveLength(3);
    expect(result.reason).toMatch(/recommended because/i);
    expect(result.evidence[0].weight).toBe(95);
  });
});
