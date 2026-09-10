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
const LEAF_DEPTH_THRESHOLD = MAX_DEPTH - 1;
const LEAVES_PER_TIP_MIN = 24;
const LEAVES_PER_TIP_JITTER = 16;
const LEAF_CLUSTER_RADIUS_FACTOR = 0.9;

/**
 * Hard cap. 6000 instanced quads is nothing for the GPU; this keeps buffer
 * sizes predictable across pathological URLs, not the framerate.
 */
export const MAX_LEAVES = 6000;

function segmentLength(s: BranchSegment): number {
  return Math.hypot(s.end[0] - s.start[0], s.end[1] - s.start[1], s.end[2] - s.start[2]);
}

export function generateLeaves(segments: BranchSegment[], seed: number): CanopyData {
  const leaves: LeafInstance[] = [];

  for (let i = 0; i < segments.length && leaves.length < MAX_LEAVES; i++) {
    const segment = segments[i];
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
          segment.end[1] + radius * cosPhi,
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
