import { describe, expect, it } from 'vitest';
import { MAX_DEPTH, TRUNK_SEGMENTS, generateBranches, tiltAndSpin } from './BranchGenerator';
import { seedFromUrl } from './seedFromUrl';

const GRID = 33;
const SEEDS = [0, 1, seedFromUrl('https://optilink.app'), seedFromUrl('https://example.com/a/b')];

describe('tiltAndSpin', () => {
  it('does not produce NaN for a straight-up direction', () => {
    // Crossing [0,1,0] with world-up gives a zero vector; the reference axis
    // has to be picked explicitly or the whole tree becomes NaN.
    expect(tiltAndSpin([0, 1, 0], 25, 137).every(Number.isFinite)).toBe(true);
  });

  it('keeps the direction a unit vector', () => {
    const [x, y, z] = tiltAndSpin([0, 1, 0], 25, 40);
    expect(Math.hypot(x, y, z)).toBeCloseTo(1, 6);
  });

  it('tilts by the requested angle', () => {
    const [, y] = tiltAndSpin([0, 1, 0], 30, 0);
    expect(y).toBeCloseTo(Math.cos(30 * (Math.PI / 180)), 6);
  });
});

describe('generateBranches', () => {
  it('is deterministic for the same seed', () => {
    expect(generateBranches(SEEDS[2], GRID)).toEqual(generateBranches(SEEDS[2], GRID));
  });

  it('produces a different structure for a different seed', () => {
    expect(generateBranches(SEEDS[2], GRID)).not.toEqual(generateBranches(SEEDS[3], GRID));
  });

  it('never emits NaN coordinates', () => {
    for (const seed of SEEDS) {
      for (const s of generateBranches(seed, GRID)) {
        expect([...s.start, ...s.end, s.startRadius, s.endRadius].every(Number.isFinite)).toBe(true);
      }
    }
  });

  it('starts with a contiguous trunk rooted at the origin', () => {
    const segments = generateBranches(SEEDS[2], GRID);
    const trunk = segments.filter((s) => s.depth === -1);
    expect(trunk).toHaveLength(TRUNK_SEGMENTS);
    expect(trunk[0].start).toEqual([0, 0, 0]);
    for (let i = 1; i < trunk.length; i++) {
      expect(trunk[i].start).toEqual(trunk[i - 1].end);
    }
    // The trunk must actually lift the branching off the ground.
    expect(trunk[trunk.length - 1].end[1]).toBeGreaterThan(GRID * 0.4);
  });

  it('branches from the trunk top, not from the ground', () => {
    const segments = generateBranches(SEEDS[2], GRID);
    const trunkTop = segments.filter((s) => s.depth === -1).at(-1)!.end;
    expect(segments.find((s) => s.depth === 0)!.start).toEqual(trunkTop);
  });

  it('respects the depth limit and tapers radii', () => {
    for (const s of generateBranches(SEEDS[2], GRID)) {
      expect(s.depth).toBeLessThanOrEqual(MAX_DEPTH);
      expect(s.endRadius).toBeLessThan(s.startRadius);
      expect(s.startRadius).toBeGreaterThan(0);
    }
  });

  it('stays within the bounded segment count for any seed', () => {
    for (const seed of SEEDS) {
      const count = generateBranches(seed, GRID).length;
      expect(count).toBeGreaterThan(TRUNK_SEGMENTS);
      expect(count).toBeLessThanOrEqual(TRUNK_SEGMENTS + 364);
    }
  });

  it('scales with the grid size', () => {
    const small = generateBranches(SEEDS[2], 21);
    const large = generateBranches(SEEDS[2], 41);
    expect(large[0].endRadius).toBeGreaterThan(small[0].endRadius);
  });
});
