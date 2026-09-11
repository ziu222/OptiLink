import type { IThemeConfig } from '../../types/bio';

export const SEASONAL_THEMES = [
  { id: 'spring', name: 'Petal diary', season: 'Xuân · cánh đào', effect: 'sakura', colors: ['#f2e5df', '#e5cbd3', '#fff9f5', '#513d46', '#ead5dc'] },
  { id: 'summer', name: 'After the sun', season: 'Hạ · đom đóm', effect: 'firefly', colors: ['#1c3430', '#40564a', '#233d35', '#f0eedc', '#456253'] },
  { id: 'autumn', name: 'Amber notes', season: 'Thu · lá phong', effect: 'leaf', colors: ['#eee1cd', '#d5bba3', '#fcf5e9', '#594331', '#ead5b9'] },
  { id: 'winter', name: 'Quiet snowfall', season: 'Đông · tuyết nhẹ', effect: 'snow', colors: ['#c3d0da', '#8296a9', '#f4f7fa', '#35495b', '#dce5ed'] },
] as const;

export function seasonalTheme(id: string): IThemeConfig | undefined {
  const season = SEASONAL_THEMES.find(item => item.id === id);
  if (!season) return undefined;
  const [start, end, card, ink, button] = season.colors;
  return {
    preset: id, layout: 'card_floating',
    background: { type: 'gradient', value: `linear-gradient(135deg, ${start}, ${end})` },
    heroBanner: { enabled: false }, profile: { avatarFrame: 'none' },
    cardStyling: { background: card, borderStyle: 'none', borderRadius: '28px' },
    textColor: ink, fontFamily: "'Inter', sans-serif", effect: season.effect,
    buttonStyle: { hoverEffect: 'hover-lift', borderRadius: '16px', backgroundColor: button, textColor: ink },
  };
}
