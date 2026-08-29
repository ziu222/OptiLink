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
    borderColor: z.string().optional(),
    borderThickness: z.string().optional(),
    borderRadius: z.string().optional()
  }).optional(),
  profile: z.object({
    avatarDecorationUrl: z.string().optional(),
    avatarFrame: z.enum(['none', 'neon', 'discord', 'image']).optional()
  }).optional(),
  effect: z.enum(['none', 'sakura', 'snow', 'star', 'rain', 'leaf', 'bubble']).optional(),
  buttonStyle: z.object({
    hoverEffect: z.enum(['hover-color', 'hover-scale', 'hover-lift', 'hover-glow']).optional(),
    borderRadius: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional()
  }).optional(),
  fontFamily: z.string().optional(),
  textColor: z.string().optional()
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
  username: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_.-]+$/).optional(),
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
  badges: z.object({
    early: z.boolean().optional(),
    pro: z.boolean().optional()
  }).optional(),
  isActive: z.boolean().optional()
});
