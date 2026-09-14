import { z } from 'zod';

export const profileSchema = z.object({
  username: z
    .string()
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(30, 'Tên người dùng tối đa 30 ký tự')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Chỉ được dùng chữ cái, số, dấu chấm, gạch ngang và gạch dưới'),
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
});

export type ProfileValues = z.infer<typeof profileSchema>;
