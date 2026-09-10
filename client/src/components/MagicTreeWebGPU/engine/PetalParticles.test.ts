import { describe, expect, it } from 'vitest';
import type { WeatherKind } from '../../MagicTreeQR/types/magicTree';
import { generateBranches } from './BranchGenerator';
import { generateLeaves } from './LeafInstances';
import { generateFallingParticles } from './PetalParticles';
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

  it('emits particles for every falling season', () => {
    for (const weather of ['sakura', 'leavesRain', 'snow'] as WeatherKind[]) {
      expect(generateFallingParticles(weather, canopy, SPREAD, SEED).length).toBeGreaterThan(0);
    }
  });

  it('spawns inside the spread radius and within the canopy', () => {
    for (const p of generateFallingParticles('snow', canopy, SPREAD, SEED)) {
      expect(Math.hypot(p.x, p.z)).toBeLessThanOrEqual(SPREAD + 1e-9);
      expect(p.canopyY).toBeGreaterThan(0);
      expect(p.canopyY).toBeLessThanOrEqual(canopy.minY + canopy.height + 1e-9);
      expect(p.drift).toBeGreaterThan(0);
      expect(p.seed).toBeGreaterThanOrEqual(0);
      expect(p.seed).toBeLessThan(1);
    }
  });
});
