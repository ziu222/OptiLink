export type BlockType = 'LINK' | 'TAB_GROUP' | 'PRODUCT_CARD' | 'SEARCH_BAR' | 'CATEGORY_FILTER' | 'TEXT' | 'IMAGE';

export interface IBackground {
  type: 'avatar_blur' | 'color' | 'gradient' | 'image' | 'gif';
  url?: string;
  value?: string;
}

export interface IProfileConfig {
  avatarDecorationUrl?: string;
  avatarFrame?: 'none' | 'neon' | 'discord' | 'image';
}

export interface IButtonStyle {
  hoverEffect: 'hover-color' | 'hover-scale' | 'hover-lift' | 'hover-glow';
  borderRadius?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ICardStyling {
  background?: string;
  borderStyle?: string;
  borderColor?: string;
  borderThickness?: string;
  borderRadius?: string;
}

export interface IThemeConfig {
  preset?: string;
  layout: 'overlap_center' | 'left_aligned' | 'minimal_top' | 'split_screen' | 'card_floating';
  background: IBackground;
  heroBanner?: {
    enabled: boolean;
    url?: string;
  };
  cardStyling?: ICardStyling;
  profile: IProfileConfig;
  effect: 'none' | 'sakura' | 'snow' | 'star' | 'rain' | 'leaf' | 'bubble' | 'confetti' | 'hearts' | 'firefly' | 'glitter';
  buttonStyle: IButtonStyle;
  fontFamily?: string;
  textColor?: string;
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
  badges?: {
    early?: boolean;
    pro?: boolean;
  };
  isActive: boolean;
}
