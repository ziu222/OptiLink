import { describe, expect, it } from 'vitest';
import type { WeatherKind } from '../../MagicTreeQR/types/magicTree';
import { generateBranches } from './BranchGenerator';
import { generateLeaves } from './LeafInstances';
import { generateFallingParticles, generatePetalCarpet } from './PetalParticles';
import { seedFromUrl } from './seedFromUrl';

const SEED = seedFromUrl('https://optilink.app');
const canopy = generateLeaves(generateBranches(SEED, 33), SEED);
const SPREAD = 12;

describe('generateFallingParticles', () => {
  it('is deterministic', () => {
    expect(generateFallingParticles('sakura', canopy, SPREAD, SEED)).toEqual(
      generateFallingParticles('sakura', canopy, SPREAD, SEED)
    );
  });

  it('emits nothing in summer', () => {
    expect(generateFallingParticles('sunbeam', canopy, SPREAD, SEED)).toHaveLength(0);
  });

  it('reserves falling flowers for Spring only', () => {
    expect(generateFallingParticles('sakura', canopy, SPREAD, SEED)).not.toHaveLength(0);
    for (const weather of ['sunbeam', 'leavesRain', 'snow'] as WeatherKind[]) {
      expect(generateFallingParticles(weather, canopy, SPREAD, SEED)).toHaveLength(0);
    }
  });

  it('spawns inside the spread radius and within the canopy', () => {
    for (const p of generateFallingParticles('sakura', canopy, SPREAD, SEED)) {
      expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(SPREAD + 1e-9);
      expect(p.canopyY).toBeGreaterThan(0);
      expect(p.canopyY).toBeLessThanOrEqual(canopy.minY + canopy.height + 1e-9);
      expect(p.drift).toBeGreaterThan(0);
      expect(p.seed).toBeGreaterThanOrEqual(0);
      expect(p.seed).toBeLessThan(1);
    }
  });
});

describe('generatePetalCarpet', () => {
  it('only creates a restrained Spring carpet', () => {
    const petals = generatePetalCarpet('sakura', SPREAD, SEED);
    expect(petals).toEqual(generatePetalCarpet('sakura', SPREAD, SEED));
    expect(petals).toHaveLength(52);
    expect(generatePetalCarpet('leavesRain', SPREAD, SEED)).toEqual([]);
    for (const petal of petals) {
      expect(Math.hypot(petal.x, petal.z)).toBeLessThanOrEqual(SPREAD * 0.36 + 1e-9);
      expect(petal.scale).toBeGreaterThan(0);
    }
  });
});
