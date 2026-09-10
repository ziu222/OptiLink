import { pseudoRandom } from './seedFromUrl';

/**
 * Decorative grass blades around the QR grid — spec §5.3.
 *
 * Strictly outside the grid footprint (§1.4): the voxel feature's two shipped
 * bugs both came from something visually interacting with the ground layer's
 * colours, and keeping grass off the grid removes that whole risk class.
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

const MARGIN_CELLS = 0.7;
const BAND_CELLS = 2.1;
const BLADES_PER_CELL = 112;
const MIN_HEIGHT_CELLS = 0.65;
const HEIGHT_JITTER_CELLS = 1.85;
const BLADES_PER_TUFT = 14;

/** Half-width of the grid's own footprint, in world units. */
export function gridHalfExtent(gridSize: number, cellSize = 1): number {
  return (gridSize * cellSize) / 2;
}

export function generateGrassRing(gridSize: number, seed: number, cellSize = 1): GrassBlade[] {
  const inner = gridHalfExtent(gridSize, cellSize) + MARGIN_CELLS * cellSize;
  const band = BAND_CELLS * cellSize;
  const count = Math.round(gridSize * BLADES_PER_CELL);
  const blades: GrassBlade[] = [];

  for (let i = 0; i < count; i++) {
    // Walk the ring's perimeter, then push outward — no rejection sampling,
    // so the count is exact and the layout stays reproducible.
    const tuft = Math.floor(i / BLADES_PER_TUFT);
    const tuftCount = Math.ceil(count / BLADES_PER_TUFT);
    const t = (tuft + 0.5) / tuftCount;
    const depth = pseudoRandom(tuft, 1, seed + 13) * band;
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
    const tuftHeight = 0.65 + pseudoRandom(tuft, 2, seed + 20) * 0.6;
    blades.push({
      x: x + Math.cos(scatterAngle) * scatter,
      z: z + Math.sin(scatterAngle) * scatter,
      height: (MIN_HEIGHT_CELLS + pseudoRandom(i, 2, seed + 14) * HEIGHT_JITTER_CELLS) * cellSize * tuftHeight,
      rotation: pseudoRandom(i, 3, seed + 15) * Math.PI,
      seed: pseudoRandom(i, 4, seed + 16),
    });
  }

  return blades;
}
