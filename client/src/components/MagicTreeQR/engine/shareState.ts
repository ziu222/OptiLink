import type { MagicTreeConfig, PaletteId, SeasonId } from '../types/magicTree';
import { DEFAULT_CONFIG } from '../types/magicTree';

const SEASON_ORDER: SeasonId[] = ['spring', 'summer', 'autumn', 'winter'];
const PALETTE_ORDER: PaletteId[] = ['rose', 'violet', 'crimson', 'gold', 'azure', 'silver'];

export function encodeShareState(config: MagicTreeConfig): string {
  const seasonIdx = SEASON_ORDER.indexOf(config.season);
  const paletteIdx = PALETTE_ORDER.indexOf(config.palette);
  const encodedUrl = btoa(unescape(encodeURIComponent(config.targetUrl)));
  return `${pad2(seasonIdx)}${pad2(paletteIdx)}${encodedUrl}`;
}

export function decodeShareState(q: string | null): MagicTreeConfig {
  if (!q || q.length < 4) return DEFAULT_CONFIG;

  const seasonIdx = Number(q.slice(0, 2));
  const paletteIdx = Number(q.slice(2, 4));
  const encodedUrl = q.slice(4);

  const season = SEASON_ORDER[seasonIdx] ?? DEFAULT_CONFIG.season;
  const palette = PALETTE_ORDER[paletteIdx] ?? DEFAULT_CONFIG.palette;

  try {
    const targetUrl = decodeURIComponent(escape(atob(encodedUrl)));
    return { targetUrl: targetUrl || DEFAULT_CONFIG.targetUrl, season, palette };
  } catch {
    return { ...DEFAULT_CONFIG, season, palette };
  }
}

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, '0');
}
