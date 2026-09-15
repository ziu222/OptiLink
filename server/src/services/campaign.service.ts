import mongoose from 'mongoose';
import { Campaign, CampaignRule, type CampaignStatus, type ICampaign, type ICampaignRule } from '../models/Campaign.js';
import Link, { type ILink } from '../models/Link.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateCampaignInput,
  CreateCampaignRuleInput,
  ListCampaignsQuery,
  UpdateCampaignInput,
  UpdateCampaignRuleInput,
} from '../validators/campaign.validator.js';

interface CampaignLinkDTO {
  id: string;
  title: string;
  slug: string;
  shortUrl: string;
  originalUrl: string;
  isActive: boolean;
}

interface CampaignRuleDTO {
  id: string;
  condition: ICampaignRule['condition'];
  targetLinkId: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignDTO {
  id: string;
  name: string;
  description: string;
  status: CampaignStatus;
  linkIds: string[];
  entryLinkId: string;
  defaultLinkId: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  links?: CampaignLinkDTO[];
  rules?: CampaignRuleDTO[];
}

const isObjectId = (id: string): boolean => mongoose.isValidObjectId(id);
const toObjectIds = (ids: string[]): mongoose.Types.ObjectId[] =>
  ids.map((id) => new mongoose.Types.ObjectId(id));
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const effectiveStatus = (campaign: ICampaign, now = new Date()): CampaignStatus => {
  if (campaign.status === 'active' && campaign.endsAt && campaign.endsAt <= now) return 'expired';
  return campaign.status;
};

const serializeLink = (link: ILink): CampaignLinkDTO => ({
  id: link._id.toString(),
  title: link.title,
  slug: link.slug,
  shortUrl: link.shortUrl,
  originalUrl: link.originalUrl,
  isActive: link.isActive,
});

const serializeRule = (rule: ICampaignRule): CampaignRuleDTO => ({
  id: rule._id.toString(),
  condition: rule.condition,
  targetLinkId: rule.targetLinkId.toString(),
  priority: rule.priority,
  createdAt: rule.createdAt.toISOString(),
  updatedAt: rule.updatedAt.toISOString(),
});

const serializeCampaign = (
  campaign: ICampaign,
  links?: ILink[],
  rules?: ICampaignRule[],
): CampaignDTO => ({
  id: campaign._id.toString(),
  name: campaign.name,
  description: campaign.description,
  status: effectiveStatus(campaign),
  linkIds: campaign.linkIds.map((id) => id.toString()),
  entryLinkId: campaign.entryLinkId.toString(),
  defaultLinkId: campaign.defaultLinkId.toString(),
  startsAt: campaign.startsAt?.toISOString() ?? null,
  endsAt: campaign.endsAt?.toISOString() ?? null,
  createdAt: campaign.createdAt.toISOString(),
  updatedAt: campaign.updatedAt.toISOString(),
  ...(links ? { links: links.map(serializeLink) } : {}),
  ...(rules ? { rules: rules.map(serializeRule) } : {}),
});

export class CampaignService {
  async createCampaign(userId: string, input: CreateCampaignInput): Promise<CampaignDTO> {
    this.validateSchedule(input.startsAt, input.endsAt);
    await this.assertLinksOwned(userId, input.linkIds);
    await this.assertEntryLinkAvailable(input.entryLinkId);

    const campaign = await Campaign.create({
      userId,
      name: input.name,
      description: input.description ?? '',
      status: input.status ?? 'draft',
      linkIds: toObjectIds(input.linkIds),
      entryLinkId: new mongoose.Types.ObjectId(input.entryLinkId),
      defaultLinkId: new mongoose.Types.ObjectId(input.defaultLinkId),
      startsAt: input.startsAt ?? null,
      endsAt: input.endsAt ?? null,
    });

    return serializeCampaign(campaign);
  }

  async listCampaigns(
    userId: string,
    query: ListCampaignsQuery,
  ): Promise<{ campaigns: CampaignDTO[]; total: number; page: number; limit: number }> {
    const now = new Date();
    const filter: mongoose.FilterQuery<ICampaign> = { userId: new mongoose.Types.ObjectId(userId) };

    if (query.status === 'active') {
      filter.status = 'active';
      filter.$and = [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
      ];
    } else if (query.status === 'expired') {
      filter.$or = [{ status: 'expired' }, { endsAt: { $lte: now } }];
    } else if (query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.search) {
      const search = { $regex: escapeRegex(query.search), $options: 'i' };
      filter.$and = [...(filter.$and ?? []), { $or: [{ name: search }, { description: search }] }];
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      Campaign.countDocuments(filter),
    ]);

    return {
      campaigns: campaigns.map((campaign) => serializeCampaign(campaign)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  async getCampaign(userId: string, campaignId: string): Promise<CampaignDTO> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    const [links, rules] = await Promise.all([
      Link.find({ _id: { $in: campaign.linkIds }, userId, isArchived: { $ne: true } }),
      CampaignRule.find({ campaignId: campaign._id }).sort({ priority: 1, createdAt: 1 }),
    ]);
    return serializeCampaign(campaign, links, rules);
  }

  async updateCampaign(userId: string, campaignId: string, patch: UpdateCampaignInput): Promise<CampaignDTO> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    const linkIds = patch.linkIds ?? campaign.linkIds.map((id) => id.toString());
    const entryLinkId = patch.entryLinkId ?? campaign.entryLinkId.toString();
    const defaultLinkId = patch.defaultLinkId ?? campaign.defaultLinkId.toString();
    const startsAt = patch.startsAt !== undefined ? patch.startsAt : campaign.startsAt;
    const endsAt = patch.endsAt !== undefined ? patch.endsAt : campaign.endsAt;

    if (!linkIds.includes(entryLinkId) || !linkIds.includes(defaultLinkId)) {
      throw AppError.unprocessable('Entry and default links must belong to the campaign');
    }
    this.validateSchedule(startsAt, endsAt);
    await this.assertLinksOwned(userId, linkIds);
    if (entryLinkId !== campaign.entryLinkId.toString()) {
      await this.assertEntryLinkAvailable(entryLinkId, campaign._id.toString());
    }

    if (patch.name !== undefined) campaign.name = patch.name;
    if (patch.description !== undefined) campaign.description = patch.description;
    if (patch.status !== undefined) campaign.status = patch.status;
    campaign.linkIds = toObjectIds(linkIds);
    campaign.entryLinkId = new mongoose.Types.ObjectId(entryLinkId);
    campaign.defaultLinkId = new mongoose.Types.ObjectId(defaultLinkId);
    campaign.startsAt = startsAt ?? null;
    campaign.endsAt = endsAt ?? null;

    await this.assertExistingRulesStillTargetLinks(campaign);
    await campaign.save();
    return serializeCampaign(campaign);
  }

  async deleteCampaign(userId: string, campaignId: string): Promise<void> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    await Promise.all([
      CampaignRule.deleteMany({ campaignId: campaign._id }),
      Campaign.deleteOne({ _id: campaign._id }),
    ]);
  }

  async addLink(userId: string, campaignId: string, linkId: string): Promise<CampaignDTO> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    if (campaign.linkIds.some((id) => id.toString() === linkId)) {
      throw AppError.conflict('Link already belongs to this campaign', 'LINK_ALREADY_IN_CAMPAIGN');
    }
    await this.assertLinksOwned(userId, [linkId]);
    campaign.linkIds.push(new mongoose.Types.ObjectId(linkId));
    await campaign.save();
    return serializeCampaign(campaign);
  }

  async removeLink(userId: string, campaignId: string, linkId: string): Promise<void> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    if (!campaign.linkIds.some((id) => id.toString() === linkId)) {
      throw AppError.notFound('Link is not part of this campaign');
    }
    if (campaign.entryLinkId.toString() === linkId || campaign.defaultLinkId.toString() === linkId) {
      throw AppError.conflict('Entry and default links cannot be removed from a campaign', 'CAMPAIGN_LINK_REQUIRED');
    }
    if (await CampaignRule.exists({ campaignId: campaign._id, targetLinkId: linkId })) {
      throw AppError.conflict('A routing rule still targets this link', 'LINK_USED_BY_RULE');
    }
    campaign.linkIds = campaign.linkIds.filter((id) => id.toString() !== linkId);
    await campaign.save();
  }

  async createRule(
    userId: string,
    campaignId: string,
    input: CreateCampaignRuleInput,
  ): Promise<CampaignRuleDTO> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    this.assertRuleTarget(campaign, input.targetLinkId);
    this.validateRuleCondition(input.condition);
    await this.assertPriorityAvailable(campaign._id, input.priority);

    const rule = await CampaignRule.create({
      campaignId: campaign._id,
      condition: input.condition,
      targetLinkId: new mongoose.Types.ObjectId(input.targetLinkId),
      priority: input.priority,
    });
    return serializeRule(rule);
  }

  async updateRule(
    userId: string,
    campaignId: string,
    ruleId: string,
    patch: UpdateCampaignRuleInput,
  ): Promise<CampaignRuleDTO> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    const rule = await this.findRule(campaign._id, ruleId);
    const targetLinkId = patch.targetLinkId ?? rule.targetLinkId.toString();
    const priority = patch.priority ?? rule.priority;

    this.assertRuleTarget(campaign, targetLinkId);
    if (patch.condition) this.validateRuleCondition(patch.condition);
    if (priority !== rule.priority) await this.assertPriorityAvailable(campaign._id, priority, rule._id.toString());

    if (patch.condition) rule.condition = patch.condition;
    rule.targetLinkId = new mongoose.Types.ObjectId(targetLinkId);
    rule.priority = priority;
    await rule.save();
    return serializeRule(rule);
  }

  async deleteRule(userId: string, campaignId: string, ruleId: string): Promise<void> {
    const campaign = await this.findOwnedCampaign(userId, campaignId);
    const rule = await this.findRule(campaign._id, ruleId);
    await rule.deleteOne();
  }

  async getActiveRoutingCampaign(entryLinkId: mongoose.Types.ObjectId): Promise<{
    campaign: ICampaign;
    rules: ICampaignRule[];
  } | null> {
    const now = new Date();
    const campaign = await Campaign.findOne({
      entryLinkId,
      status: 'active',
      $and: [
        { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: null }, { endsAt: { $gt: now } }] },
      ],
    });

    if (!campaign) {
      await Campaign.updateOne(
        { entryLinkId, status: 'active', endsAt: { $ne: null, $lte: now } },
        { status: 'expired' },
      );
      return null;
    }

    const rules = await CampaignRule.find({ campaignId: campaign._id }).sort({ priority: 1, createdAt: 1 });
    return { campaign, rules };
  }

  private async findOwnedCampaign(userId: string, campaignId: string): Promise<ICampaign> {
    if (!isObjectId(campaignId)) throw AppError.notFound('Campaign not found');
    const campaign = await Campaign.findOne({ _id: campaignId, userId });
    if (!campaign) throw AppError.notFound('Campaign not found');
    return campaign;
  }

  private async findRule(campaignId: mongoose.Types.ObjectId, ruleId: string): Promise<ICampaignRule> {
    if (!isObjectId(ruleId)) throw AppError.notFound('Campaign rule not found');
    const rule = await CampaignRule.findOne({ _id: ruleId, campaignId });
    if (!rule) throw AppError.notFound('Campaign rule not found');
    return rule;
  }

  private async assertLinksOwned(userId: string, linkIds: string[]): Promise<void> {
    if (linkIds.some((id) => !isObjectId(id))) throw AppError.unprocessable('Invalid link ID');
    const links = await Link.find({
      _id: { $in: toObjectIds(linkIds) },
      userId,
      isArchived: { $ne: true },
    }).select('_id');
    if (links.length !== linkIds.length) {
      throw AppError.unprocessable('Every campaign link must be active, unarchived, and owned by you');
    }
  }

  private async assertEntryLinkAvailable(entryLinkId: string, exceptCampaignId?: string): Promise<void> {
    const filter: mongoose.FilterQuery<ICampaign> = { entryLinkId: new mongoose.Types.ObjectId(entryLinkId) };
    if (exceptCampaignId) filter._id = { $ne: new mongoose.Types.ObjectId(exceptCampaignId) };
    if (await Campaign.exists(filter)) {
      throw AppError.conflict('This entry link already belongs to another campaign', 'ENTRY_LINK_TAKEN');
    }
  }

  private async assertExistingRulesStillTargetLinks(campaign: ICampaign): Promise<void> {
    const result = await CampaignRule.exists({
      campaignId: campaign._id,
      targetLinkId: { $nin: campaign.linkIds },
    });
    if (result) {
      throw AppError.conflict('Keep every link targeted by an existing routing rule', 'LINK_USED_BY_RULE');
    }
  }

  private assertRuleTarget(campaign: ICampaign, targetLinkId: string): void {
    if (!campaign.linkIds.some((id) => id.toString() === targetLinkId)) {
      throw AppError.unprocessable('Rule target link must belong to the campaign');
    }
  }

  private async assertPriorityAvailable(
    campaignId: mongoose.Types.ObjectId,
    priority: number,
    exceptRuleId?: string,
  ): Promise<void> {
    const filter: mongoose.FilterQuery<ICampaignRule> = { campaignId, priority };
    if (exceptRuleId) filter._id = { $ne: new mongoose.Types.ObjectId(exceptRuleId) };
    if (await CampaignRule.exists(filter)) {
      throw AppError.conflict('Rule priority is already in use', 'RULE_PRIORITY_TAKEN');
    }
  }

  private validateSchedule(startsAt?: Date | null, endsAt?: Date | null): void {
    if (startsAt && endsAt && startsAt >= endsAt) {
      throw AppError.unprocessable('End time must be after start time');
    }
  }

  private validateRuleCondition(condition: ICampaignRule['condition']): void {
    if (condition.type === 'time' && condition.startMinute === condition.endMinute) {
      throw AppError.unprocessable('Time range must not cover zero minutes');
    }
  }
}

export const campaignService = new CampaignService();
