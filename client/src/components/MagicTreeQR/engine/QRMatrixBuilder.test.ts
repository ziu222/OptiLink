import { describe, expect, it } from 'vitest';
import { buildQRMatrix, cellToWorld } from './QRMatrixBuilder';

describe('buildQRMatrix', () => {
  it('throws on empty input', () => {
    expect(() => buildQRMatrix('   ')).toThrow();
  });

  it('produces a square matrix with matching zone grid', () => {
    const grid = buildQRMatrix('https://optilink.app');
    expect(grid.matrix.length).toBe(grid.size);
    expect(grid.zones.length).toBe(grid.size);
    grid.matrix.forEach((row) => expect(row.length).toBe(grid.size));
    grid.zones.forEach((row) => expect(row.length).toBe(grid.size));
  });

  it('classifies the top-left 7x7 corner as finder', () => {
    const grid = buildQRMatrix('https://optilink.app');
    expect(grid.zones[0][0]).toBe('finder');
    expect(grid.zones[6][6]).toBe('finder');
  });

  it('classifies the three finder corners, not a fourth', () => {
    const grid = buildQRMatrix('https://optilink.app');
    const n = grid.size;
    expect(grid.zones[0][n - 1]).toBe('finder'); // top-right
    expect(grid.zones[n - 1][0]).toBe('finder'); // bottom-left
    expect(grid.zones[n - 1][n - 1]).not.toBe('finder'); // bottom-right has none
  });

  it('classifies the exact center as canopy', () => {
    const grid = buildQRMatrix('https://optilink.app');
    const mid = Math.floor((grid.size - 1) / 2);
    expect(grid.zones[mid][mid]).toBe('canopy');
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
