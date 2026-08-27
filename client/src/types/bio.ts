export type BlockType = 'LINK' | 'TAB_GROUP' | 'PRODUCT_CARD' | 'SEARCH_BAR' | 'CATEGORY_FILTER' | 'TEXT' | 'IMAGE';

export interface IBackground {
  type: 'avatar_blur' | 'color' | 'gradient' | 'image' | 'gif';
  url?: string;
  value?: string;
}

export interface IProfileConfig {
  avatarDecorationUrl?: string;
}

export interface IButtonStyle {
  hoverEffect: 'scale_up' | 'glow' | 'shake' | '3d_pop' | 'none';
  borderRadius?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface IThemeConfig {
  layout: 'overlap_center' | 'left_aligned' | 'minimal_top' | 'split_screen' | 'card_floating';
  background: IBackground;
  profile: IProfileConfig;
  effect: 'none' | 'sakura' | 'snow' | 'matrix' | 'confetti' | 'floating_particles' | 'rain' | 'shooting_stars';
  buttonStyle: IButtonStyle;
}

export interface IBlock {
  id: string;
  type: BlockType;
  tabId?: string;
  isHidden: boolean;
  order: number;
  content: any;
}

export interface IBioPage {
  _id: string;
  userId: string;
  username: string;
  title: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  themeConfig: IThemeConfig;
  blocks: IBlock[];
  isActive: boolean;
}
