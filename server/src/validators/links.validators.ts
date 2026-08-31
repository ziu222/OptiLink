import { z } from 'zod';

const SLUG_RE = /^[A-Za-z0-9_-]{1,50}$/;

export const createLinkSchema = z.object({
  originalUrl: z.string().url('Enter a valid URL'),
  title: z.string().trim().max(200).optional(),
  slug: z
    .string()
    .regex(SLUG_RE, 'Slug may only contain letters, numbers, hyphens and underscores')
    .optional(),
  expiresAt: z.coerce
    .date()
    .optional()
    .refine((d) => !d || d.getTime() > Date.now(), {
      message: 'Expiration must be in the future',
    }),
  redirectMode: z.enum(['standard', 'splash']).default('standard'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

export const verifyLinkSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const listLinksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateLinkSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    originalUrl: z.string().url('Enter a valid URL').optional(),
    status: z.enum(['active', 'inactive']).optional(),
    redirectMode: z.enum(['standard', 'splash']).optional(),
    // '' clears the password; a 6+ char string sets it; absent leaves it unchanged.
    password: z
      .union([z.literal(''), z.string().min(6, 'Password must be at least 6 characters')])
      .optional(),
    // '' / null clear the expiry; a date must be in the future.
    // Order matters: match '' and null before z.coerce.date() (which would
    // otherwise coerce null to the epoch).
    expiresAt: z
      .union([z.literal(''), z.null(), z.coerce.date()])
      .optional()
      .refine((v) => !(v instanceof Date) || v.getTime() > Date.now(), {
        message: 'Expiration must be in the future',
      }),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'No fields to update' });

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;
