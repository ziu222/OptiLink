import { z } from 'zod';

export const backgroundSchema = z.object({
  type: z.enum(['avatar_blur', 'color', 'gradient', 'image', 'gif']),
  url: z.string().optional(),
  value: z.string().optional()
});

export const themeConfigSchema = z.object({
  preset: z.string().optional(),
  layout: z.enum(['overlap_center', 'left_aligned', 'minimal_top', 'split_screen', 'card_floating']).optional(),
  background: backgroundSchema.optional(),
  heroBanner: z.object({
    enabled: z.boolean().optional(),
    url: z.string().optional()
  }).optional(),
  cardStyling: z.object({
    background: z.string().optional(),
    borderStyle: z.string().optional(),
    borderRadius: z.string().optional()
  }).optional(),
  profile: z.object({
    avatarDecorationUrl: z.string().optional()
  }).optional(),
  effect: z.enum(['none', 'sakura', 'snow', 'matrix', 'confetti', 'floating_particles', 'rain', 'shooting_stars']).optional(),
  buttonStyle: z.object({
    hoverEffect: z.enum(['scale_up', 'glow', 'shake', '3d_pop', 'none']).optional(),
    borderRadius: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional()
  }).optional(),
  fontFamily: z.string().optional()
});

export const blockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['LINK', 'TAB_GROUP', 'PRODUCT_CARD', 'SEARCH_BAR', 'CATEGORY_FILTER', 'TEXT', 'IMAGE']),
  tabId: z.string().optional(),
  isHidden: z.boolean().optional(),
  order: z.number().optional(),
  content: z.record(z.any())
});

export const bioPageSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  socialLinks: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    youtube: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional()
  }).optional(),
  themeConfig: themeConfigSchema.optional(),
  blocks: z.array(blockSchema).optional(),
  isActive: z.boolean().optional()
});
