import { api } from '../lib/axios';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'expired';
export type EditableCampaignStatus = Exclude<CampaignStatus, 'expired'>;
export type CampaignRuleType = 'device' | 'country' | 'language' | 'time';

export interface CampaignRuleCondition {
  type: CampaignRuleType;
  values?: string[];
  startMinute?: number;
  endMinute?: number;
  timezone?: string;
}

export interface Campaign {
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
}

export interface CampaignRule {
  id: string;
  priority: number;
  targetLinkId: string;
  condition: CampaignRuleCondition;
}

export interface CampaignLink {
  id: string;
  title: string;
  shortUrl: string;
  originalUrl: string;
  isActive: boolean;
}

export interface CampaignDetail extends Campaign {
  rules: CampaignRule[];
  links: CampaignLink[];
}

export interface CampaignInput {
  name: string;
  description?: string;
  status: EditableCampaignStatus;
  linkIds: string[];
  entryLinkId: string;
  defaultLinkId: string;
}

export interface CampaignUpdateInput {
  name?: string;
  description?: string;
  status?: EditableCampaignStatus;
  linkIds?: string[];
  entryLinkId?: string;
  defaultLinkId?: string;
  startsAt?: string | null;
  endsAt?: string | null;
}

export interface CampaignRuleInput {
  priority: number;
  targetLinkId: string;
  condition: CampaignRuleCondition;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const res = await api.get('/campaigns');
  return res.data.data.campaigns;
}

export async function getCampaign(id: string): Promise<CampaignDetail> {
  const res = await api.get(`/campaigns/${id}`);
  return res.data.data.campaign;
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const res = await api.post('/campaigns', input);
  return res.data.data.campaign;
}

export async function updateCampaign(id: string, input: CampaignUpdateInput): Promise<Campaign> {
  const res = await api.patch(`/campaigns/${id}`, input);
  return res.data.data.campaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  await api.delete(`/campaigns/${id}`);
}

export async function addCampaignLink(id: string, linkId: string): Promise<Campaign> {
  const res = await api.post(`/campaigns/${id}/links`, { linkId });
  return res.data.data.campaign;
}

export async function removeCampaignLink(id: string, linkId: string): Promise<void> {
  await api.delete(`/campaigns/${id}/links/${linkId}`);
}

export async function createCampaignRule(
  campaignId: string,
  input: CampaignRuleInput,
): Promise<CampaignRule> {
  const res = await api.post(`/campaigns/${campaignId}/rules`, input);
  return res.data.data.rule;
}

export async function updateCampaignRule(
  campaignId: string,
  ruleId: string,
  input: Partial<CampaignRuleInput>,
): Promise<CampaignRule> {
  const res = await api.patch(`/campaigns/${campaignId}/rules/${ruleId}`, input);
  return res.data.data.rule;
}

export async function deleteCampaignRule(campaignId: string, ruleId: string): Promise<void> {
  await api.delete(`/campaigns/${campaignId}/rules/${ruleId}`);
}
