import { z } from 'zod';

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const qrConfigSchema = z.object({
  fgColor: z
    .string()
    .regex(hexColorRegex, 'Màu foreground phải là mã HEX hợp lệ (vd: #000000)')
    .default('#000000'),
  bgColor: z
    .string()
    .regex(hexColorRegex, 'Màu background phải là mã HEX hợp lệ (vd: #ffffff)')
    .default('#ffffff'),
  logoUrl: z.string().url('Logo URL không hợp lệ').nullable().optional(),
  eyeType: z.enum(['square', 'rounded', 'dot']).default('square'),
  dotType: z.enum(['square', 'rounded', 'dots']).default('square'),
  size: z.coerce.number().min(128).max(4096).default(512),
  errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
});

export const createQrSchema = z.object({
  targetUrl: z.string().url('URL đích không hợp lệ').max(2048),
  title: z.string().trim().max(120).optional().default('My QR Code'),
  linkId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'linkId không đúng định dạng ObjectId')
    .optional(),
  config: qrConfigSchema.partial().optional(),
});

export const downloadQrQuerySchema = z.object({
  format: z.enum(['png', 'svg']).default('png'),
  size: z.coerce.number().min(128).max(4096).optional(),
});

export type CreateQrInput = z.infer<typeof createQrSchema>;
export type DownloadQrQuery = z.infer<typeof downloadQrQuerySchema>;
