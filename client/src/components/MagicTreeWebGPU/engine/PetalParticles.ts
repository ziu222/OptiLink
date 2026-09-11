import type { WeatherKind } from '../../MagicTreeQR/types/magicTree';
import type { CanopyData } from './LeafInstances';
import { pseudoRandom } from './seedFromUrl';

/**
 * Spring flower instance data. Every particle is a constant plus a `time`
 * uniform in the shader: no stored velocity or per-frame CPU work.
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

export const PARTICLE_COUNT = 34;
const DRIFT_FACTOR = 0.12;

/** Falling blossom belongs only to the Spring scene. */
function countFor(weather: WeatherKind): number {
  return weather === 'sakura' ? 34 : 0;
}

export interface SettledPetal {
  x: number;
  z: number;
  scale: number;
  rotation: number;
  seed: number;
}

/** A quiet, persistent carpet around the Spring trunk — not random confetti. */
export function generatePetalCarpet(weather: WeatherKind, spreadRadius: number, seed: number): SettledPetal[] {
  if (weather !== 'sakura') return [];
  const petals: SettledPetal[] = [];
  for (let i = 0; i < 52; i++) {
    const angle = pseudoRandom(i, 21, seed) * Math.PI * 2;
    const radius = spreadRadius * (0.045 + Math.sqrt(pseudoRandom(i, 22, seed)) * 0.31);
    petals.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      scale: 0.17 + pseudoRandom(i, 23, seed) * 0.13,
      rotation: pseudoRandom(i, 24, seed) * Math.PI * 2,
      seed: pseudoRandom(i, 25, seed),
    });
  }
  return petals;
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
    const source = canopy.leaves[Math.floor(pseudoRandom(i, 0, seed + 7) * canopy.leaves.length)];
    const angle = source ? Math.atan2(source.position[2], source.position[0]) : pseudoRandom(i, 0, seed + 7) * Math.PI * 2;
    const radius = source ? Math.min(spreadRadius, Math.hypot(source.position[0], source.position[2])) : spreadRadius * Math.sqrt(pseudoRandom(i, 1, seed + 8));
    particles.push({
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      canopyY: source?.position[1] ?? canopy.minY + canopy.height * 0.7,
      drift: spreadRadius * DRIFT_FACTOR * (0.5 + pseudoRandom(i, 3, seed + 10)),
      seed: pseudoRandom(i, 4, seed + 11),
    });
  }

  return particles;
}
