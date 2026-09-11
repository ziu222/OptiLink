import { pseudoRandom } from './seedFromUrl';
import { cellToWorld } from '../../MagicTreeQR/engine/QRMatrixBuilder';

/**
 * Low-poly tufts for the QR garden. One tuft maps to one dark QR module while
 * the sparse outer ring only frames the garden instead of competing with it.
 */

export interface GrassBlade {
  x: number;
  z: number;
  /** Blade height in world units; tips sway most (§5.3). */
  height: number;
  /** Facing angle, so the ring isn't a row of identical quads. */
  rotation: number;
  seed: number;
}

const MARGIN_CELLS = 0.55;
const BAND_CELLS = 0.72;
const TUFTS_PER_GRID_CELL = 4;
const MIN_HEIGHT_CELLS = 0.36;
const HEIGHT_JITTER_CELLS = 0.35;

/** Half-width of the grid's own footprint, in world units. */
export function gridHalfExtent(gridSize: number, cellSize = 1): number {
  return (gridSize * cellSize) / 2;
}

export function generateGrassRing(gridSize: number, seed: number, cellSize = 1): GrassBlade[] {
  const inner = gridHalfExtent(gridSize, cellSize) + MARGIN_CELLS * cellSize;
  const band = BAND_CELLS * cellSize;
  const count = Math.round(gridSize * TUFTS_PER_GRID_CELL);
  const blades: GrassBlade[] = [];

  for (let i = 0; i < count; i++) {
    // Walk the ring's perimeter, then push outward — no rejection sampling,
    // so the count is exact and the layout stays reproducible.
    const t = (i + 0.5) / count;
    const depth = pseudoRandom(i, 1, seed + 13) * band;
    const edge = Math.floor(t * 4) % 4;
    const along = (t * 4 - Math.floor(t * 4)) * 2 * inner - inner;

    let x: number;
    let z: number;
    if (edge === 0) {
      x = along;
      z = -(inner + depth);
    } else if (edge === 1) {
      x = inner + depth;
      z = along;
    } else if (edge === 2) {
      x = along;
      z = inner + depth;
    } else {
      x = -(inner + depth);
      z = along;
    }

    const scatterAngle = pseudoRandom(i, 5, seed + 18) * Math.PI * 2;
    const scatter = pseudoRandom(i, 6, seed + 19) * 0.42 * cellSize;
    blades.push({
      x: x + Math.cos(scatterAngle) * scatter,
      z: z + Math.sin(scatterAngle) * scatter,
      height: (MIN_HEIGHT_CELLS + pseudoRandom(i, 2, seed + 14) * HEIGHT_JITTER_CELLS) * cellSize,
      rotation: pseudoRandom(i, 3, seed + 15) * Math.PI,
      seed: pseudoRandom(i, 4, seed + 16),
    });
  }

  return blades;
}

/** Every active QR module becomes one restrained, Blender-authored grass tuft. */
export function generateQrGrass(matrix: readonly (readonly boolean[])[], seed: number, cellSize = 1): GrassBlade[] {
  const size = matrix.length;
  const tufts: GrassBlade[] = [];
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
    if (!matrix[row]?.[col]) continue;
    const { x, z } = cellToWorld(row, col, size);
    tufts.push({
      x,
      z,
      height: (0.4 + pseudoRandom(row, col, seed + 61) * 0.23) * cellSize,
      rotation: pseudoRandom(row, col, seed + 62) * Math.PI,
      seed: pseudoRandom(row, col, seed + 63),
    });
  }
  return tufts;
}
