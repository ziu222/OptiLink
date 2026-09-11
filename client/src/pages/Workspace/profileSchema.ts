import { z } from 'zod';

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Letters, numbers, dots, dashes and underscores only'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
