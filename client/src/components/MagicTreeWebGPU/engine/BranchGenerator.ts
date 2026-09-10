import { Vector3 } from 'three';
import { pseudoRandom } from './seedFromUrl';

/**
 * Recursive branch generation — spec §3.2/§3.3. Pure logic: no WebGPU, no
 * rendering concerns, no Math.random().
 */

export type Vec3 = [number, number, number];

export interface BranchSegment {
  start: Vec3;
  end: Vec3;
  startRadius: number;
  endRadius: number;
  /** -1 = trunk segment, 0..MAX_DEPTH = branch depth. */
  depth: number;
}

// Trunk — without this the tree branches straight off the ground and reads as a shrub.
export const TRUNK_SEGMENTS = 3;
const TRUNK_SEGMENT_LENGTH_FACTOR = 0.145;
const TRUNK_LEAN_JITTER_DEG = 4;
const TRUNK_TAPER = 0.88;

// Branching
export const MAX_DEPTH = 5;
const INITIAL_LENGTH_FACTOR = 0.12;
const INITIAL_RADIUS_FACTOR = 0.027;
const LENGTH_DECAY = 0.72;
const RADIUS_DECAY = 0.68;
const MIN_RADIUS_FACTOR = 0.05;
const BASE_BRANCH_ANGLE_DEG = 25;
const BRANCH_ANGLE_JITTER_DEG = 10;
const EXTRA_BRANCH_CHANCE = 0.3;

const DEG_TO_RAD = Math.PI / 180;

/**
 * Tilt `dir` away from itself by `tiltDeg`, then spin the result around `dir`
 * by `azimuthDeg`.
 *
 * The reference axis is picked explicitly: the first call's direction is
 * exactly [0, 1, 0], and crossing that with world-up gives a zero vector,
 * which normalises to NaN and takes the whole tree with it.
 */
export function tiltAndSpin(dir: Vec3, tiltDeg: number, azimuthDeg: number): Vec3 {
  const d = new Vector3(dir[0], dir[1], dir[2]).normalize();
  const ref = Math.abs(d.y) > 0.99 ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0);
  const perp = new Vector3().crossVectors(d, ref).normalize();
  const out = d
    .clone()
    .applyAxisAngle(perp, tiltDeg * DEG_TO_RAD)
    .applyAxisAngle(d, azimuthDeg * DEG_TO_RAD);
  return [out.x, out.y, out.z];
}

function addScaled(from: Vec3, dir: Vec3, length: number): Vec3 {
  return [from[0] + dir[0] * length, from[1] + dir[1] * length, from[2] + dir[2] * length];
}

export function generateBranches(seed: number, gridSize: number): BranchSegment[] {
  const segments: BranchSegment[] = [];
  const trunkSegmentLength = gridSize * TRUNK_SEGMENT_LENGTH_FACTOR;
  const initialLength = gridSize * INITIAL_LENGTH_FACTOR;
  const initialRadius = gridSize * INITIAL_RADIUS_FACTOR;
  const minRadius = initialRadius * MIN_RADIUS_FACTOR;

  // Trunk: a straight-ish run before the first split.
  let cursor: Vec3 = [0, 0, 0];
  let direction: Vec3 = [0, 1, 0];
  let radius = initialRadius;
  for (let i = 0; i < TRUNK_SEGMENTS; i++) {
    const lean = (pseudoRandom(-1, i, seed) * 2 - 1) * TRUNK_LEAN_JITTER_DEG;
    direction = tiltAndSpin(direction, lean, pseudoRandom(-1, i, seed + 1) * 360);
    const end = addScaled(cursor, direction, trunkSegmentLength);
    segments.push({
      start: cursor,
      end,
      startRadius: radius,
      endRadius: radius * TRUNK_TAPER,
      depth: -1,
    });
    cursor = end;
    radius *= TRUNK_TAPER;
  }

  const recurse = (
    start: Vec3,
    dir: Vec3,
    length: number,
    r: number,
    depth: number,
    branchIndex: number
  ): void => {
    const end = addScaled(start, dir, length);
    segments.push({ start, end, startRadius: r, endRadius: r * RADIUS_DECAY, depth });
    if (depth >= MAX_DEPTH || r * RADIUS_DECAY < minRadius) return;

    const childCount = depth === 0 ? 5 : pseudoRandom(depth, branchIndex, seed) < EXTRA_BRANCH_CHANCE ? 3 : 2;
    for (let i = 0; i < childCount; i++) {
      const jitter =
        (pseudoRandom(depth, branchIndex * 10 + i, seed) * 2 - 1) * BRANCH_ANGLE_JITTER_DEG;
      const azimuth = depth === 0
        ? i * 137.508 + pseudoRandom(i, 0, seed + 1) * 24
        : i * (360 / childCount) + pseudoRandom(depth, branchIndex, seed + 1) * 360;
      const childDir = tiltAndSpin(dir, (depth === 0 ? 52 : BASE_BRANCH_ANGLE_DEG) + jitter, azimuth);
      // A short central leader opens into five broad scaffold limbs. Unique
      // node indices avoid reusing the first child's jitter at every depth.
      recurse(end, childDir, depth === 0 ? gridSize * 0.24 : length * LENGTH_DECAY,
        r * RADIUS_DECAY, depth + 1, branchIndex * 4 + i + 1);
    }
  };

  recurse(cursor, direction, initialLength, radius, 0, 0);
  return segments;
}
