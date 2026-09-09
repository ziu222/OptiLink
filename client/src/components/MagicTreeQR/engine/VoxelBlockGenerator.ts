export type BlockType = 'dirt' | 'trunk' | 'grass' | 'fallenPetals' | 'cherryBlossom';

export interface VoxelBlock {
  col: number;
  row: number;
  layer: number;
  type: BlockType;
}

const TRUNK_RADIUS = 2.5;
const TRUNK_LAYERS = 12;
const MAX_CANOPY_LAYERS = 12;
const CANOPY_RADIUS_FACTOR = 0.46;

/**
 * Deterministic sine-hash pseudo-random — the same (col, row, seed) always
 * returns the same value. Never use Math.random() here: real randomness
 * reshuffles on every rebuild, which is exactly what read as "messy" in
 * user feedback on an earlier attempt.
 */
export function pseudoRandom(col: number, row: number, seed = 0): number {
  const s = Math.sin(col * 127.1 + row * 311.7 + seed * 43.7) * 43758.5;
  return s - Math.floor(s);
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}

export function generateVoxelBlocks(matrix: boolean[][], size: number): VoxelBlock[] {
  const blocks: VoxelBlock[] = [];
  const center = size / 2;
  const canopyOuterRadius = size * CANOPY_RADIUS_FACTOR;
  const canopyBaseLayer = TRUNK_LAYERS;

  // Pass 1: ground layer, every cell (this is also what makes the flat
  // top-down view exactly reproduce the QR matrix — one cube per module).
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const dark = matrix[row][col];
      const dist = distance(col, row, center, center);

      let type: BlockType = 'dirt';
      if (dark) {
        if (dist < TRUNK_RADIUS) type = 'trunk';
        else if (dist >= canopyOuterRadius) type = 'grass';
        else type = 'fallenPetals';
      }
      blocks.push({ col, row, layer: 0, type });
    }
  }

  // Pass 2: trunk column
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!matrix[row][col]) continue;
      const dist = distance(col, row, center, center);
      if (dist < TRUNK_RADIUS) {
        for (let layer = 1; layer < TRUNK_LAYERS; layer++) {
          blocks.push({ col, row, layer, type: 'trunk' });
        }
      }
    }
  }

  // Pass 3: canopy dome
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!matrix[row][col]) continue;
      const dist = distance(col, row, center, center);
      if (dist >= canopyOuterRadius) continue;

      const t = 1 - dist / canopyOuterRadius; // 1 at center, 0 at edge
      const layersHere = Math.max(3, Math.round(MAX_CANOPY_LAYERS * (0.25 + 0.75 * t * t)));
      const domeOffset = Math.floor(t * 3);

      for (let layer = 0; layer < layersHere; layer++) {
        blocks.push({ col, row, layer: canopyBaseLayer + layer + domeOffset, type: 'cherryBlossom' });
      }

      // Deterministic organic variation — 0..3 extra blocks, never random.
      const extraCount = Math.floor(pseudoRandom(col, row, 500) * 4);
      for (let e = 0; e < extraCount; e++) {
        blocks.push({
          col,
          row,
          layer: canopyBaseLayer + layersHere + e + domeOffset,
          type: 'cherryBlossom',
        });
      }
    }
  }

  return blocks;
}
