import { z } from 'zod';

const OBJECT_ID_RE = /^[a-f\d]{24}$/i;
const objectId = z.string().regex(OBJECT_ID_RE, 'Invalid resource ID');
const optionalDate = z.union([z.coerce.date(), z.null()]).optional();

const campaignStatus = z.enum(['draft', 'active', 'paused']);
const uniqueIds = (ids: string[]) => new Set(ids).size === ids.length;

const campaignFields = {
  name: z.string().trim().min(1, 'Campaign name is required').max(120),
  description: z.string().trim().max(500).optional(),
  status: campaignStatus.optional(),
  startsAt: optionalDate,
  endsAt: optionalDate,
};

export const createCampaignSchema = z
  .object({
    ...campaignFields,
    linkIds: z.array(objectId).min(1).max(100).refine(uniqueIds, 'Link IDs must be unique'),
    entryLinkId: objectId,
    defaultLinkId: objectId,
  })
  .superRefine((data, ctx) => {
    if (!data.linkIds.includes(data.entryLinkId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['entryLinkId'], message: 'Entry link must belong to the campaign' });
    }
    if (!data.linkIds.includes(data.defaultLinkId)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['defaultLinkId'], message: 'Default link must belong to the campaign' });
    }
    if (data.startsAt && data.endsAt && data.startsAt >= data.endsAt) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endsAt'], message: 'End time must be after start time' });
    }
  });

export const updateCampaignSchema = z
  .object({
    ...campaignFields,
    linkIds: z.array(objectId).min(1).max(100).refine(uniqueIds, 'Link IDs must be unique').optional(),
    entryLinkId: objectId.optional(),
    defaultLinkId: objectId.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export const listCampaignsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['all', 'draft', 'active', 'paused', 'expired']).default('all'),
  search: z.string().trim().max(120).optional(),
});

export const addCampaignLinkSchema = z.object({ linkId: objectId });

const ruleConditionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('device'), values: z.array(z.enum(['mobile', 'tablet', 'desktop'])).min(1).max(3) }),
  z.object({ type: z.literal('country'), values: z.array(z.string().regex(/^[A-Z]{2}$/, 'Use ISO 3166-1 alpha-2 country codes')).min(1).max(50) }),
  z.object({ type: z.literal('language'), values: z.array(z.string().regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, 'Use a BCP 47 language tag')).min(1).max(20) }),
  z.object({
    type: z.literal('time'),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(0).max(1439),
    timezone: z.string().trim().min(1).max(64).default('UTC'),
  }),
]);

export const createCampaignRuleSchema = z.object({
  condition: ruleConditionSchema,
  targetLinkId: objectId,
  priority: z.coerce.number().int().min(1).max(1000),
});

export const updateCampaignRuleSchema = z
  .object({
    condition: ruleConditionSchema.optional(),
    targetLinkId: objectId.optional(),
    priority: z.coerce.number().int().min(1).max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update' });

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type ListCampaignsQuery = z.infer<typeof listCampaignsQuerySchema>;
export type CreateCampaignRuleInput = z.infer<typeof createCampaignRuleSchema>;
export type UpdateCampaignRuleInput = z.infer<typeof updateCampaignRuleSchema>;
