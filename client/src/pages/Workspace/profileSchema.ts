import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  avatarUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

export type ProfileValues = z.infer<typeof profileSchema>;
