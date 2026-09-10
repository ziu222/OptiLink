/**
 * Deterministic seeding for the WebGPU tree — spec §3.1.
 *
 * The sine-hash lives in the shipped voxel engine; it is re-exported rather
 * than copied so both features stay on one formula. Importing is not the same
 * as modifying, so this still honours spec §1.4's "zero changes to MagicTreeQR".
 */
export { pseudoRandom } from '../../MagicTreeQR/engine/VoxelBlockGenerator';

/** Same URL always produces the same tree. Never Math.random(). */
export function seedFromUrl(url: string): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (h * 31 + url.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
