import { z } from 'zod';

export const analyticsRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type AnalyticsRangeQuery = z.infer<typeof analyticsRangeQuerySchema>;
