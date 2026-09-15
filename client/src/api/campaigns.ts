import { api } from '../lib/axios';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'expired';
export interface Campaign { id: string; name: string; description: string; status: CampaignStatus; linkIds: string[]; entryLinkId: string; defaultLinkId: string; startsAt: string | null; endsAt: string | null; createdAt: string; }
export interface CampaignRule { id: string; priority: number; targetLinkId: string; condition: { type: 'device' | 'country' | 'language' | 'time'; values?: string[]; startMinute?: number; endMinute?: number; timezone?: string; }; }
export interface CampaignDetail extends Campaign { rules: CampaignRule[]; links: { id: string; title: string; shortUrl: string; originalUrl: string; isActive: boolean }[]; }

export async function listCampaigns() { const res = await api.get('/campaigns'); return res.data.data.campaigns as Campaign[]; }
export async function getCampaign(id: string) { const res = await api.get(`/campaigns/${id}`); return res.data.data.campaign as CampaignDetail; }
export async function createCampaign(input: { name: string; description?: string; status: CampaignStatus; linkIds: string[]; entryLinkId: string; defaultLinkId: string }) { const res = await api.post('/campaigns', input); return res.data.data.campaign as Campaign; }
