import { z } from 'zod';

const slugPattern = /^[A-Za-z0-9_-]{1,50}$/;

export const shortenLinkSchema = z
  .object({
    url: z.string().url('Vui lòng nhập URL hợp lệ'),
    title: z.string().optional(),
    slug: z
      .string()
      .regex(slugPattern, 'Slug chỉ được chứa chữ cái, số, gạch ngang và gạch dưới')
      .optional()
      .or(z.literal('')),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional().or(z.literal('')),
    expiresAt: z.string().optional().or(z.literal('')),
    redirectMode: z.enum(['standard', 'splash']),
    status: z.enum(['active', 'inactive']),
  })
  .refine((data) => !data.expiresAt || new Date(data.expiresAt) > new Date(), {
    message: 'Thời hạn phải ở trong tương lai',
    path: ['expiresAt'],
  });

export type ShortenLinkValues = z.infer<typeof shortenLinkSchema>;
