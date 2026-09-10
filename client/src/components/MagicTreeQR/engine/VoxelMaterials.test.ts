import { describe, expect, it } from 'vitest';
import { shade, baseColorForType, buildCubeMaterials } from './VoxelMaterials';
import { SEASON_THEMES } from '../types/magicTree';

describe('shade', () => {
  it('lightens toward white with a positive amount', () => {
    expect(shade('#000000', 0.2)).toBe('#333333');
  });

  it('darkens toward black with a negative amount', () => {
    expect(shade('#ffffff', -0.2)).toBe('#cccccc');
  });

  it('clamps at the color boundaries', () => {
    expect(shade('#ffffff', 0.5)).toBe('#ffffff');
    expect(shade('#000000', -0.5)).toBe('#000000');
  });
});

describe('baseColorForType', () => {
  it('maps every block type to its theme or accent color', () => {
    const theme = SEASON_THEMES.spring;
    expect(baseColorForType('dirt', theme, '#ff0000')).toBe(theme.groundLight);
    expect(baseColorForType('grass', theme, '#ff0000')).toBe(theme.groundDark);
    expect(baseColorForType('trunk', theme, '#ff0000')).toBe(theme.trunk);
    expect(baseColorForType('cherryBlossom', theme, '#ff0000')).toBe('#ff0000');
    expect(baseColorForType('fallenPetals', theme, '#ff0000')).toBe(theme.canopySecondary);
  });

  it('falls back to the theme canopy color when no accent is given', () => {
    const theme = SEASON_THEMES.spring;
    expect(baseColorForType('cherryBlossom', theme, '')).toBe(theme.canopyPrimary);
  });
});

describe('buildCubeMaterials', () => {
  it('returns 6 materials with the top (+y, index 2) brightest and bottom (-y, index 3) darkest', () => {
    const materials = buildCubeMaterials('#808080');
    expect(materials.length).toBe(6);
    expect(`#${materials[2].color.getHexString()}`).toBe(shade('#808080', 0.18));
    expect(`#${materials[3].color.getHexString()}`).toBe(shade('#808080', -0.3));
  });
});
