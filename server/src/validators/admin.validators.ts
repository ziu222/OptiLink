import { z } from 'zod';

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(['all', 'active', 'banned']).default('all'),
  sort: z.enum(['newest', 'oldest']).default('newest'),
});

export const updateUserSchema = z
  .object({
    role: z.enum(['user', 'admin']).optional(),
    tier: z.enum(['FREE', 'PREMIUM']).optional(),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'No fields to update' });

export const banUserSchema = z.object({
  isBanned: z.boolean(),
});

export const listAdminLinksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(200).optional(),
  status: z.enum(['all', 'active', 'inactive']).default('all'),
  sort: z.enum(['newest', 'oldest', 'clicks']).default('newest'),
});

// Mirrors links.validators.ts's updateLinkSchema — kept as its own copy (not
// imported) so the admin API surface stays independent of the user-facing one.
export const updateAdminLinkSchema = z
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
    expiresAt: z
      .union([z.literal(''), z.null(), z.coerce.date()])
      .optional()
      .refine((v) => !(v instanceof Date) || v.getTime() > Date.now(), {
        message: 'Expiration must be in the future',
      }),
  })
  .refine((o) => Object.keys(o).length > 0, { message: 'No fields to update' });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type ListAdminLinksQuery = z.infer<typeof listAdminLinksQuerySchema>;
export type UpdateAdminLinkInput = z.infer<typeof updateAdminLinkSchema>;
