import { describe, expect, it } from 'vitest';
import { generateVoxelBlocks, pseudoRandom } from './VoxelBlockGenerator';

function emptyMatrix(size: number): boolean[][] {
  return Array.from({ length: size }, () => Array(size).fill(false));
}

describe('pseudoRandom', () => {
  it('is deterministic for the same inputs', () => {
    expect(pseudoRandom(5, 5, 500)).toBe(pseudoRandom(5, 5, 500));
  });

  it('returns a value in [0, 1)', () => {
    for (let i = 0; i < 20; i++) {
      const v = pseudoRandom(i, i * 2, 500);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('differs across seeds for the same cell', () => {
    expect(pseudoRandom(3, 4, 1)).not.toBe(pseudoRandom(3, 4, 2));
  });
});

describe('generateVoxelBlocks', () => {
  it('produces exactly one dirt block per cell when every module is light', () => {
    const size = 5;
    const blocks = generateVoxelBlocks(emptyMatrix(size), size);
    expect(blocks.length).toBe(size * size);
    blocks.forEach((b) => {
      expect(b.type).toBe('dirt');
      expect(b.layer).toBe(0);
    });
  });

  it('builds a full trunk column plus a canopy dome for a single dark cell at the exact center', () => {
    const size = 10; // center = (5, 5)
    const matrix = emptyMatrix(size);
    matrix[5][5] = true;

    const blocks = generateVoxelBlocks(matrix, size);
    const trunkBlocks = blocks.filter((b) => b.type === 'trunk');
    const canopyBlocks = blocks.filter((b) => b.type === 'cherryBlossom');

    // 1 ground-layer block (pass 1) + 11 stacked blocks (pass 2, layers 1..11) = 12
    expect(trunkBlocks.length).toBe(12);
    expect(trunkBlocks.map((b) => b.layer).sort((a, b) => a - b)).toEqual(
      Array.from({ length: 12 }, (_, i) => i)
    );

    // t=1 at dead center -> layersHere = round(12 * (0.25 + 0.75)) = 12, domeOffset = floor(3) = 3
    const expectedExtra = Math.floor(pseudoRandom(5, 5, 500) * 4);
    expect(canopyBlocks.length).toBe(12 + expectedExtra);
    const layers = canopyBlocks.map((b) => b.layer).sort((a, b) => a - b);
    expect(layers[0]).toBe(12 + 0 + 3); // canopyBaseLayer(12) + layer(0) + domeOffset(3)
    expect(layers[11]).toBe(12 + 11 + 3);
  });

  it('gives every cell its own ground block even where a trunk/canopy grows above it', () => {
    const size = 10;
    const matrix = emptyMatrix(size);
    matrix[5][5] = true;
    const blocks = generateVoxelBlocks(matrix, size);
    expect(blocks.filter((b) => b.layer === 0).length).toBe(size * size);
  });
});
