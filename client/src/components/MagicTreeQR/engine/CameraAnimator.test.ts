import { describe, expect, it } from 'vitest';
import { quinticEase } from './CameraAnimator';

describe('quinticEase', () => {
  it('starts at 0 and ends at 1', () => {
    expect(quinticEase(0)).toBeCloseTo(0);
    expect(quinticEase(1)).toBeCloseTo(1);
  });

  it('is exactly 0.5 at the midpoint', () => {
    expect(quinticEase(0.5)).toBeCloseTo(0.5);
  });

  it('is monotonically increasing', () => {
    expect(quinticEase(0.25)).toBeLessThan(quinticEase(0.75));
  });
});
