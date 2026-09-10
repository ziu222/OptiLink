import { describe, expect, it } from 'vitest';
import { pseudoRandom, seedFromUrl } from './seedFromUrl';

describe('seedFromUrl', () => {
  it('returns the same seed for the same URL', () => {
    expect(seedFromUrl('https://optilink.app')).toBe(seedFromUrl('https://optilink.app'));
  });

  it('returns different seeds for different URLs', () => {
    expect(seedFromUrl('https://optilink.app')).not.toBe(seedFromUrl('https://optilink.app/x'));
  });

  it('returns a non-negative safe integer for long URLs', () => {
    const seed = seedFromUrl(`https://optilink.app/${'a'.repeat(500)}`);
    expect(Number.isSafeInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
  });

  it('handles the empty string without throwing', () => {
    expect(seedFromUrl('')).toBe(0);
  });
});

describe('pseudoRandom re-export', () => {
  it('is the voxel engine hash, in [0, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const v = pseudoRandom(i, i * 3, 7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('is deterministic', () => {
    expect(pseudoRandom(2, 5, 11)).toBe(pseudoRandom(2, 5, 11));
  });
});
