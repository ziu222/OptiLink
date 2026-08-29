import mongoose, { Document, Schema } from 'mongoose';

// 1. Interfaces cho Theme Config
export interface IBackground {
  type: 'avatar_blur' | 'color' | 'gradient' | 'image' | 'gif';
  url?: string;
  value?: string; // For color or gradient value
}

export interface IProfileConfig {
  avatarDecorationUrl?: string; // Khung avatar
}

export interface IButtonStyle {
  hoverEffect: 'scale_up' | 'glow' | 'shake' | '3d_pop' | 'none';
  borderRadius?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface ICardStyling {
  background?: string;
  borderStyle?: string;
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
  effect: 'none' | 'sakura' | 'snow' | 'matrix' | 'confetti' | 'floating_particles' | 'rain' | 'shooting_stars';
  buttonStyle: IButtonStyle;
  fontFamily?: string;
}

// 2. Interfaces cho Block
export type BlockType = 'LINK' | 'TAB_GROUP' | 'PRODUCT_CARD' | 'SEARCH_BAR' | 'CATEGORY_FILTER' | 'TEXT' | 'IMAGE';

export interface IBlock {
  id: string; // Unique ID for drag-and-drop
  type: BlockType;
  tabId?: string; // Thuộc về tab nào (Dành cho Affiliate Storefront)
  isHidden: boolean;
  order: number;
  content: any; // Dùng any/Mixed để linh hoạt lưu trữ JSON tùy theo type
}

// 3. Interface chính cho BioPage
export interface IBioPage extends Document {
  userId: mongoose.Types.ObjectId;
  username: string; // Đường dẫn URL, ví dụ: opti.link/b/lucvu
  
  // Thông tin hiển thị cơ bản
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
  createdAt: Date;
  updatedAt: Date;
}

// 4. Định nghĩa Mongoose Schema
const BlockSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['LINK', 'TAB_GROUP', 'PRODUCT_CARD', 'SEARCH_BAR', 'CATEGORY_FILTER', 'TEXT', 'IMAGE']
  },
  tabId: { type: String, default: 'main' },
  isHidden: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  content: { type: Schema.Types.Mixed, required: true } // Linh hoạt lưu JSON
}, { _id: false });

const BioPageSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true // Tạm thời mỗi User có 1 Bio Page chính
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-zA-Z0-9_.-]+$/ // Validate username format
  },
  
  title: { type: String, required: true, default: 'My Bio Page' },
  bio: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    youtube: { type: String, default: '' },
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  
  themeConfig: {
    preset: { type: String, default: 'custom' },
    layout: { 
      type: String, 
      enum: ['overlap_center', 'left_aligned', 'minimal_top', 'split_screen', 'card_floating'],
      default: 'overlap_center' 
    },
    background: {
      type: { 
        type: String, 
        enum: ['avatar_blur', 'color', 'gradient', 'image', 'gif'],
        default: 'avatar_blur'
      },
      url: { type: String, default: '' },
      value: { type: String, default: '' }
    },
    heroBanner: {
      enabled: { type: Boolean, default: true },
      url: { type: String, default: '' }
    },
    cardStyling: {
      background: { type: String, default: '' },
      borderStyle: { type: String, default: '' },
      borderRadius: { type: String, default: '' }
    },
    profile: {
      avatarDecorationUrl: { type: String, default: '' }
    },
    effect: { 
      type: String,
      enum: ['none', 'sakura', 'snow', 'matrix', 'confetti', 'floating_particles', 'rain', 'shooting_stars'],
      default: 'none'
    },
    buttonStyle: {
      hoverEffect: { 
        type: String,
        enum: ['scale_up', 'glow', 'shake', '3d_pop', 'none'],
        default: 'scale_up'
      },
      borderRadius: { type: String, default: '12px' },
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#000000' }
    },
    fontFamily: { type: String, default: 'Outfit' }
  },
  
  blocks: [BlockSchema],
  
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes tối ưu hóa tốc độ
BioPageSchema.index({ username: 1 });
BioPageSchema.index({ userId: 1 });

export default mongoose.model<IBioPage>('BioPage', BioPageSchema);
