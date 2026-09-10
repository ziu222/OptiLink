import { describe, expect, it } from 'vitest';
import { generateBranches } from './BranchGenerator';
import { MAX_LEAVES, generateLeaves } from './LeafInstances';
import { seedFromUrl } from './seedFromUrl';

const GRID = 33;
const SEED = seedFromUrl('https://optilink.app');
const segments = generateBranches(SEED, GRID);

describe('generateLeaves', () => {
  it('is deterministic for the same input', () => {
    expect(generateLeaves(segments, SEED)).toEqual(generateLeaves(segments, SEED));
  });

  it('fills the canopy densely enough to read as one', () => {
    // v1.0.0's 3-6 leaves per tip gave a few hundred quads: visibly sparse twigs.
    expect(generateLeaves(segments, SEED).leaves.length).toBeGreaterThan(1000);
  });

  it('never exceeds the hard cap', () => {
    for (const url of ['https://optilink.app', 'https://example.com/'.padEnd(300, 'x')]) {
      const s = seedFromUrl(url);
      expect(generateLeaves(generateBranches(s, GRID), s).leaves.length).toBeLessThanOrEqual(MAX_LEAVES);
    }
  });

  it('emits finite positions and seeds in [0, 1)', () => {
    for (const leaf of generateLeaves(segments, SEED).leaves) {
      expect(leaf.position.every(Number.isFinite)).toBe(true);
      expect(leaf.seed).toBeGreaterThanOrEqual(0);
      expect(leaf.seed).toBeLessThan(1);
    }
  });

  it('reports a canopy bounding box the shader can divide by', () => {
    const { leaves, minY, height } = generateLeaves(segments, SEED);
    expect(height).toBeGreaterThan(0);
    for (const leaf of leaves) {
      expect(leaf.position[1]).toBeGreaterThanOrEqual(minY - 1e-9);
      expect(leaf.position[1]).toBeLessThanOrEqual(minY + height + 1e-9);
    }
  });

  it('keeps leaves above the ground grid', () => {
    // Leaves hanging below y=0 would sit on top of QR cells in the isometric view.
    const { minY } = generateLeaves(segments, SEED);
    expect(minY).toBeGreaterThan(0);
  });

  it('returns a usable box when there are no leaves', () => {
    const empty = generateLeaves([], SEED);
    expect(empty.leaves).toHaveLength(0);
    expect(empty.height).toBeGreaterThan(0);
  });
});
