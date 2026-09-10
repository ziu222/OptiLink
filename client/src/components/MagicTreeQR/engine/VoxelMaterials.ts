import * as THREE from 'three';
import type { BlockType } from './VoxelBlockGenerator';
import type { SeasonTheme } from '../types/magicTree';

/** Lighten (positive) or darken (negative) a hex color by a fixed, deterministic amount — never a lighting calculation. */
export function shade(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = clamp(((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = clamp((num & 0xff) + Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function baseColorForType(
  type: BlockType,
  theme: SeasonTheme,
  accentColor: string
): string {
  switch (type) {
    case 'dirt':
      return theme.groundLight;
    case 'grass':
      return theme.groundDark;
    case 'trunk':
      return theme.trunk;
    case 'cherryBlossom':
      return accentColor || theme.canopyPrimary;
    case 'fallenPetals':
      return theme.canopySecondary;
  }
}

/**
 * 6 unlit materials for a BoxGeometry's face groups, in Three.js's fixed
 * order [+x, -x, +y, -y, +z, -z]. Top (+y) is brightest, the two side pairs
 * get two darker tones, bottom (-y) is darkest (never actually visible from
 * either camera state, but still needs a material slot).
 */
export function buildCubeMaterials(baseColor: string): THREE.MeshBasicMaterial[] {
  const top = new THREE.MeshBasicMaterial({ color: shade(baseColor, 0.18) });
  const sideA = new THREE.MeshBasicMaterial({ color: shade(baseColor, -0.1) });
  const sideB = new THREE.MeshBasicMaterial({ color: shade(baseColor, -0.22) });
  const bottom = new THREE.MeshBasicMaterial({ color: shade(baseColor, -0.3) });
  return [sideA, sideA, top, bottom, sideB, sideB];
}
