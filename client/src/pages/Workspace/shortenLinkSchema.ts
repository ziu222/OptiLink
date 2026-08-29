import { z } from 'zod';

const slugPattern = /^[A-Za-z0-9_-]{1,50}$/;

export const shortenLinkSchema = z
  .object({
    url: z.string().url('Enter a valid URL'),
    title: z.string().optional(),
    slug: z
      .string()
      .regex(slugPattern, 'Slug may only contain letters, numbers, hyphens and underscores')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    expiresAt: z.string().optional().or(z.literal('')),
  })
  .refine((data) => !data.expiresAt || new Date(data.expiresAt) > new Date(), {
    message: 'Expiration must be in the future',
    path: ['expiresAt'],
  });

export type ShortenLinkValues = z.infer<typeof shortenLinkSchema>;
