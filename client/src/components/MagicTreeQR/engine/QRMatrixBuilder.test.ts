import { describe, expect, it } from 'vitest';
import { buildQRMatrix, cellToWorld } from './QRMatrixBuilder';

describe('buildQRMatrix', () => {
  it('throws on empty input', () => {
    expect(() => buildQRMatrix('   ')).toThrow();
  });

  it('produces a square boolean matrix', () => {
    const grid = buildQRMatrix('https://optilink.app');
    expect(grid.matrix.length).toBe(grid.size);
    grid.matrix.forEach((row) => expect(row.length).toBe(grid.size));
  });

  it('has no zones field — classification now happens in VoxelBlockGenerator', () => {
    const grid = buildQRMatrix('https://optilink.app');
    expect('zones' in grid).toBe(false);
  });
});

describe('cellToWorld', () => {
  it('maps the matrix center to world origin', () => {
    const size = 25;
    const mid = (size - 1) / 2;
    const { x, z } = cellToWorld(mid, mid, size);
    expect(x).toBeCloseTo(0);
    expect(z).toBeCloseTo(0);
  });

  it('maps row/col to z/x respectively, scaled by cellSize', () => {
    const { x, z } = cellToWorld(0, 1, 3, 2);
    // mid = 1, so col 1 -> x = 0, row 0 -> z = -1 * 2 = -2
    expect(x).toBeCloseTo(0);
    expect(z).toBeCloseTo(-2);
  });
});
