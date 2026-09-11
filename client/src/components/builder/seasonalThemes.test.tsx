import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { SEASONAL_THEMES, seasonalTheme } from './seasonalThemes';
import { FallingEffect } from '../effects/FallingEffect';

describe('seasonal biopage themes', () => {
  it('ships four complete, independent palettes', () => {
    expect(SEASONAL_THEMES).toHaveLength(4);
    for (const { id, effect } of SEASONAL_THEMES) {
      const theme = seasonalTheme(id)!;
      expect(theme.effect).toBe(effect);
      expect(theme.profile.avatarFrame).toBe('none');
      expect(theme.buttonStyle.textColor).toBe(theme.textColor);
      expect(theme.heroBanner?.enabled).toBe(false);
      expect(JSON.parse(JSON.stringify(theme))).toEqual(theme);
    }
    expect(seasonalTheme('missing')).toBeUndefined();
  });
  it('does not mutate presets when editing a theme', () => {
    const theme = seasonalTheme('spring')!;
    theme.background.value = 'red';
    expect(seasonalTheme('spring')!.background.value).not.toBe('red');
  });
  it('renders bounded decorative particles with a pause state and immediate negative delays', () => {
    const html = renderToStaticMarkup(<FallingEffect effect="sakura" paused />);
    expect(html.match(/bio-particle--sakura/g)).toHaveLength(24);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('data-paused="true"');
    expect(html).toContain('--delay:-');
    expect(renderToStaticMarkup(<FallingEffect effect="none" />)).toBe('');
  });
});
