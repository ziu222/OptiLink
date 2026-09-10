import type { SeasonId } from '../../MagicTreeQR/types/magicTree';

/** Scenic colours are independent of the high-contrast QR colours. */
export const TREE_ART: Record<SeasonId, {
  canopy: string; petal: string; grass: string; trunk: string; background: string; ink: string;
}> = {
  spring: { canopy: '#ed9cb5', petal: '#ffe1e8', grass: '#789d52', trunk: '#805741', background: '#f5f1e8', ink: '#743448' },
  summer: { canopy: '#83b74b', petal: '#d5e999', grass: '#609340', trunk: '#785540', background: '#f5f1e8', ink: '#31572b' },
  autumn: { canopy: '#dc8740', petal: '#f6c868', grass: '#9d9449', trunk: '#79503d', background: '#f5efe4', ink: '#754120' },
  winter: { canopy: '#c6d8d6', petal: '#ffffff', grass: '#8faaa0', trunk: '#71645c', background: '#edf1ef', ink: '#35555c' },
};
