import { describe, expect, it } from 'vitest';
import { generateGrassRing, generateQrGrass, gridHalfExtent } from './GrassRing';
import { cellToWorld } from '../../MagicTreeQR/engine/QRMatrixBuilder';
import { seedFromUrl } from './seedFromUrl';

const SEED = seedFromUrl('https://optilink.app');

describe('generateGrassRing', () => {
  it('is deterministic', () => {
    expect(generateGrassRing(33, SEED)).toEqual(generateGrassRing(33, SEED));
  });

  it('never places a blade on the QR grid', () => {
    // A blade over a module is exactly the bug class §1.4 designs out.
    for (const gridSize of [21, 33, 45]) {
      const half = gridHalfExtent(gridSize);
      for (const blade of generateGrassRing(gridSize, SEED)) {
        expect(Math.max(Math.abs(blade.x), Math.abs(blade.z))).toBeGreaterThan(half);
      }
    }
  });

  it('keeps the ring close to the grid, not scattered', () => {
    const half = gridHalfExtent(33);
    for (const blade of generateGrassRing(33, SEED)) {
      expect(Math.max(Math.abs(blade.x), Math.abs(blade.z))).toBeLessThan(half + 4);
    }
  });

  it('covers all four sides', () => {
    const blades = generateGrassRing(33, SEED);
    const half = gridHalfExtent(33);
    expect(blades.some((b) => b.z < -half)).toBe(true);
    expect(blades.some((b) => b.z > half)).toBe(true);
    expect(blades.some((b) => b.x < -half)).toBe(true);
    expect(blades.some((b) => b.x > half)).toBe(true);
  });

  it('scales its density with the grid so it looks consistent at any QR size', () => {
    expect(generateGrassRing(45, SEED).length).toBeGreaterThan(generateGrassRing(21, SEED).length);
  });

  it('emits usable blade attributes', () => {
    for (const blade of generateGrassRing(33, SEED)) {
      expect(blade.height).toBeGreaterThan(0);
      expect(blade.rotation).toBeGreaterThanOrEqual(0);
      expect(blade.rotation).toBeLessThanOrEqual(Math.PI);
      expect(blade.seed).toBeGreaterThanOrEqual(0);
      expect(blade.seed).toBeLessThan(1);
    }
  });
});

describe('generateQrGrass', () => {
  const matrix = [
    [true, false, true],
    [false, true, false],
    [true, false, false],
  ];

  it('is deterministic and creates exactly one tuft for each dark QR module', () => {
    const tufts = generateQrGrass(matrix, SEED);
    expect(tufts).toEqual(generateQrGrass(matrix, SEED));
    expect(tufts).toHaveLength(4);
  });

  it('places every tuft at the centre of its own QR module', () => {
    const expected = matrix.flatMap((row, rowIndex) => row.flatMap((active, colIndex) =>
      active ? [cellToWorld(rowIndex, colIndex, matrix.length)] : []
    ));
    expect(generateQrGrass(matrix, SEED).map(({ x, z }) => ({ x, z }))).toEqual(expected);
  });
});
