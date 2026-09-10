import type { WeatherKind } from '../../MagicTreeQR/types/magicTree';
import type { CanopyData } from './LeafInstances';
import { pseudoRandom } from './seedFromUrl';

/**
 * Falling petal/leaf/snow instance data — spec §5.2. Every particle is a
 * constant here plus a `time` uniform in the shader: no stored velocity, no
 * per-frame CPU work, no compute pipeline.
 */

export interface FallingParticle {
  /** Spawn column, in world units around the trunk. */
  x: number;
  z: number;
  /** Y the particle falls from; it loops back here on its own in the shader. */
  canopyY: number;
  /** Horizontal wind drift amplitude. */
  drift: number;
  /** Per-particle hash: loop duration, phase, dissolve, size jitter. */
  seed: number;
}

const PARTICLE_COUNT = 64;
const DRIFT_FACTOR = 0.12;

/** Summer is the one season the reference gives no falling particles. */
function countFor(weather: WeatherKind): number {
  return weather === 'sunbeam' ? 0 : PARTICLE_COUNT;
}

export function generateFallingParticles(
  weather: WeatherKind,
  canopy: CanopyData,
  spreadRadius: number,
  seed: number
): FallingParticle[] {
  const particles: FallingParticle[] = [];
  const count = countFor(weather);

  for (let i = 0; i < count; i++) {
    const angle = pseudoRandom(i, 0, seed + 7) * Math.PI * 2;
    const radius = spreadRadius * Math.sqrt(pseudoRandom(i, 1, seed + 8));
    particles.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      canopyY: canopy.minY + canopy.height * (0.4 + pseudoRandom(i, 2, seed + 9) * 0.6),
      drift: spreadRadius * DRIFT_FACTOR * (0.5 + pseudoRandom(i, 3, seed + 10)),
      seed: pseudoRandom(i, 4, seed + 11),
    });
  }

  return particles;
}
