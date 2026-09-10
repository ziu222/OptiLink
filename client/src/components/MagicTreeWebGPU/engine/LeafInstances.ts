import type { BranchSegment, Vec3 } from './BranchGenerator';
import { MAX_DEPTH } from './BranchGenerator';
import { pseudoRandom } from './seedFromUrl';

/**
 * Canopy leaf instance data — spec §3.4/§3.5. One instanced quad per leaf;
 * brightness and sway phase are derived in the shader from `seed`, so nothing
 * per-leaf beyond a position and a hash is uploaded.
 */

export interface LeafInstance {
  position: Vec3;
  seed: number;
}

export interface CanopyData {
  leaves: LeafInstance[];
  /** Canopy bounding box on Y, for the shader's height-based shading (§4.4). */
  minY: number;
  height: number;
}

/** The outer two levels carry leaves — a canopy needs volume, not a shell. */
const LEAF_DEPTH_THRESHOLD = MAX_DEPTH - 2;
const LEAVES_PER_TIP_MIN = 18;
const LEAVES_PER_TIP_JITTER = 12;
const LEAF_CLUSTER_RADIUS_FACTOR = 1.3;

/**
 * Hard cap. 6000 instanced quads is nothing for the GPU; this keeps buffer
 * sizes predictable across pathological URLs, not the framerate.
 */
export const MAX_LEAVES = 10000;

function segmentLength(s: BranchSegment): number {
  return Math.hypot(s.end[0] - s.start[0], s.end[1] - s.start[1], s.end[2] - s.start[2]);
}

export function generateLeaves(segments: BranchSegment[], seed: number): CanopyData {
  const leaves: LeafInstance[] = [];

  const trunk = segments.filter(segment => segment.depth === -1);
  if (trunk.length) {
    const grid = trunk[0].startRadius / 0.027;
    const top = trunk.at(-1)!.end;
    // Layered crown clusters fill the space between branch-tip sprays. Each
    // cluster owns a patch of the crown, avoiding both isolated balls and a
    // uniform point-cloud. Stratified centres keep every seed well balanced.
    const clusters = 84;
    for (let i = 0; i < clusters; i++) {
      const angle = i * 2.399963;
      const disk = Math.sqrt((i + 0.5) / clusters);
      const tier = pseudoRandom(i, 41, seed);
      const cx = top[0] + Math.cos(angle) * disk * grid * 0.43;
      const cz = top[2] + Math.sin(angle) * disk * grid * 0.43;
      const cy = top[1] + grid * (0.09 + 0.3 * (1 - disk * disk) + tier * 0.12);
      const spread = grid * (0.07 + pseudoRandom(i, 42, seed) * 0.04);
      for (let k = 0; k < 78; k++) {
        const r = spread * Math.cbrt(pseudoRandom(i, k, seed + 43));
        const a = pseudoRandom(i, k, seed + 44) * Math.PI * 2;
        const y = pseudoRandom(i, k, seed + 45) * 2 - 1;
        const radial = Math.sqrt(1 - y * y);
        leaves.push({ position: [cx + Math.cos(a) * radial * r, cy + y * r * 0.8, cz + Math.sin(a) * radial * r], seed: pseudoRandom(i, k, seed + 46) });
      }
    }
  }

  // Interleave the scaffold limbs before applying the budget, so a large
  // tree never loses all foliage on its last-generated side.
  const eligible = segments.map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => segment.depth >= LEAF_DEPTH_THRESHOLD)
    .sort((a, b) => pseudoRandom(a.index, 9, seed) - pseudoRandom(b.index, 9, seed));
  for (let n = 0; n < eligible.length && leaves.length < MAX_LEAVES; n++) {
    const { segment, index: i } = eligible[n];
    if (segment.depth < LEAF_DEPTH_THRESHOLD) continue;

    const clusterRadius = segmentLength(segment) * LEAF_CLUSTER_RADIUS_FACTOR;
    const count =
      LEAVES_PER_TIP_MIN + Math.floor(pseudoRandom(segment.depth, i, seed + 2) * LEAVES_PER_TIP_JITTER);

    for (let k = 0; k < count && leaves.length < MAX_LEAVES; k++) {
      // Uniform-ish inside the cluster sphere: cube-rooted radius, spherical angles.
      const radius = clusterRadius * Math.cbrt(pseudoRandom(i, k, seed + 3));
      const theta = pseudoRandom(i, k, seed + 4) * Math.PI * 2;
      const cosPhi = pseudoRandom(i, k, seed + 5) * 2 - 1;
      const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);
      leaves.push({
        position: [
          segment.end[0] + radius * sinPhi * Math.cos(theta),
          Math.max(0.5, segment.end[1] + radius * cosPhi * 0.65),
          segment.end[2] + radius * sinPhi * Math.sin(theta),
        ],
        seed: pseudoRandom(i, k, seed + 6),
      });
    }
  }

  let minY = Infinity;
  let maxY = -Infinity;
  for (const leaf of leaves) {
    if (leaf.position[1] < minY) minY = leaf.position[1];
    if (leaf.position[1] > maxY) maxY = leaf.position[1];
  }

  return {
    leaves,
    minY: leaves.length ? minY : 0,
    height: leaves.length ? Math.max(maxY - minY, 1e-3) : 1e-3,
  };
}
