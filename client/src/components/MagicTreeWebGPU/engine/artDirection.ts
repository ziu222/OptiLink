import type { SeasonId } from '../../MagicTreeQR/types/magicTree';

/** Scenic colours are independent of the high-contrast QR colours. */
export const TREE_ART: Record<SeasonId, {
  canopy: string; petal: string; grass: string; trunk: string; background: string; ink: string; qr: string;
}> = {
  spring: { canopy: '#d88fab', petal: '#f5c6d5', grass: '#687a3e', trunk: '#6d4936', background: '#f6f0e5', ink: '#743448', qr: '#315f3b' },
  summer: { canopy: '#6d9c47', petal: '#c8dc87', grass: '#59733a', trunk: '#6e4a35', background: '#f5f1e6', ink: '#31572b', qr: '#315f3b' },
  autumn: { canopy: '#c97635', petal: '#eab75a', grass: '#8c8044', trunk: '#704635', background: '#f6eee2', ink: '#754120', qr: '#315f3b' },
  winter: { canopy: '#9aaead', petal: '#edf5f1', grass: '#83938a', trunk: '#625850', background: '#edf2ed', ink: '#35555c', qr: '#315f3b' },
};
