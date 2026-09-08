import { describe, expect, it } from 'vitest';
import { buildQRMatrix } from './QRMatrixBuilder';
import { buildShrubFinders } from './ShrubFinderBuilder';
import { SEASON_THEMES } from '../types/magicTree';

describe('buildShrubFinders', () => {
  const grid = buildQRMatrix('https://optilink.app');
  const result = buildShrubFinders(grid, SEASON_THEMES.spring);

  it('covers every cell PedestalBuilder skips', () => {
    // One ground-level mesh per finder-zone cell, plus one core per corner.
    const finderCells = grid.zones.flat().filter((z) => z === 'finder').length;
    expect(finderCells).toBe(3 * 64);
    expect(result.group.children.length).toBe(finderCells + 3);
  });

  it('places a mesh at the world position of every finder cell', () => {
    const covered = new Set(
      result.group.children.map((c) => `${c.position.x.toFixed(3)}|${c.position.z.toFixed(3)}`)
    );
    const mid = (grid.size - 1) / 2;
    for (let r = 0; r < grid.size; r++) {
      for (let c = 0; c < grid.size; c++) {
        if (grid.zones[r][c] !== 'finder') continue;
        const key = `${(c - mid).toFixed(3)}|${(r - mid).toFixed(3)}`;
        expect(covered.has(key)).toBe(true);
      }
    }
  });
});
