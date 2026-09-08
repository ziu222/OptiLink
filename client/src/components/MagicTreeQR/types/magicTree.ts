export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherKind = 'sakura' | 'sunbeam' | 'leavesRain' | 'snow';
export type PaletteId = 'rose' | 'violet' | 'crimson' | 'gold' | 'azure' | 'silver';

export interface SeasonTheme {
  id: SeasonId;
  label: string;
  canopyPrimary: string;
  canopySecondary: string;
  trunk: string;
  groundLight: string;
  groundDark: string;
  background: string;
  weather: WeatherKind;
}

export const SEASON_THEMES: Record<SeasonId, SeasonTheme> = {
  spring: {
    id: 'spring',
    label: 'Xuân',
    canopyPrimary: '#FFB7C5',
    canopySecondary: '#F472B6',
    trunk: '#8B5A2B',
    groundLight: '#FDFBF7',
    groundDark: '#FBCFE8',
    background: '#F6F1E7',
    weather: 'sakura',
  },
  summer: {
    id: 'summer',
    label: 'Hạ',
    canopyPrimary: '#22C55E',
    canopySecondary: '#15803D',
    trunk: '#5C4033',
    groundLight: '#FEF3C7',
    groundDark: '#334155',
    background: '#FAF7EE',
    weather: 'sunbeam',
  },
  autumn: {
    id: 'autumn',
    label: 'Thu',
    canopyPrimary: '#F59E0B',
    canopySecondary: '#DC2626',
    trunk: '#6B4423',
    groundLight: '#E5E7EB',
    groundDark: '#475569',
    background: '#EDE8DF',
    weather: 'leavesRain',
  },
  winter: {
    id: 'winter',
    label: 'Đông',
    canopyPrimary: '#E2E8F0',
    canopySecondary: '#93C5FD',
    trunk: '#374151',
    groundLight: '#F8FAFC',
    groundDark: '#CBD5E1',
    background: '#F1F5F9',
    weather: 'snow',
  },
};

export interface PalettePreset {
  id: PaletteId;
  label: string;
  color: string;
}

export const PALETTE_PRESETS: PalettePreset[] = [
  { id: 'rose', label: 'Pastel Rose', color: '#FFB7C5' },
  { id: 'violet', label: 'Royal Violet', color: '#A855F7' },
  { id: 'crimson', label: 'Crimson Red', color: '#EF4444' },
  { id: 'gold', label: 'Golden Glow', color: '#EAB308' },
  { id: 'azure', label: 'Azure Blue', color: '#3B82F6' },
  { id: 'silver', label: 'Silver Stealth', color: '#94A3B8' },
];

export interface MagicTreeConfig {
  targetUrl: string;
  season: SeasonId;
  palette: PaletteId;
}

export const DEFAULT_CONFIG: MagicTreeConfig = {
  targetUrl: 'https://optilink.app',
  season: 'spring',
  palette: 'rose',
};
