import { describe, expect, it } from 'vitest';
import { SEASON_THEMES, PALETTE_PRESETS } from './magicTree';

function shade(hex: string, amount: number): string {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xff) + Math.round(255 * amount));
  const g = clamp(((num >> 8) & 0xff) + Math.round(255 * amount));
  const b = clamp((num & 0xff) + Math.round(255 * amount));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  const toLinear = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = toLinear((num >> 16) & 0xff);
  const g = toLinear((num >> 8) & 0xff);
  const b = toLinear(num & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CONTRAST = 3;

describe('flat-view color contrast', () => {
  it('every season groundDark clears minimum contrast against its own groundLight, after top-face shading', () => {
    for (const theme of Object.values(SEASON_THEMES)) {
      const lightTop = shade(theme.groundLight, 0.18);
      const darkTop = shade(theme.groundDark, 0.18);
      const ratio = contrastRatio(lightTop, darkTop);
      expect(ratio, `${theme.id} groundDark vs groundLight`).toBeGreaterThanOrEqual(MIN_CONTRAST);
    }
  });

  it('every palette accent clears minimum contrast against every season groundLight, after top-face shading', () => {
    for (const theme of Object.values(SEASON_THEMES)) {
      const lightTop = shade(theme.groundLight, 0.18);
      for (const palette of PALETTE_PRESETS) {
        const accentTop = shade(palette.color, 0.18);
        const ratio = contrastRatio(lightTop, accentTop);
        expect(
          ratio,
          `${theme.id} groundLight vs ${palette.id} accent`
        ).toBeGreaterThanOrEqual(MIN_CONTRAST);
      }
    }
  });
});
