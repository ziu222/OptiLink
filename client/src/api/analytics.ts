import { api } from '../lib/axios';

export interface RecentActivity {
  linkId: string;
  clickedAt: string;
}

export interface OverviewData {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  recentActivity: RecentActivity[];
}

export interface LocationBreakdown {
  country: string;
  clicks: number;
}

export interface DeviceBreakdown {
  device: string;
  clicks: number;
}

export interface LinkAnalyticsData {
  linkId: string;
  totalClicks: number;
  clicksToday: number;
  locations: LocationBreakdown[];
  devices: DeviceBreakdown[];
}

export const getOverview = async (): Promise<OverviewData> => {
  const res = await api.get('/analytics/overview');
  return res.data.data;
};

export const getLinkAnalytics = async (id: string): Promise<LinkAnalyticsData> => {
  const res = await api.get(`/analytics/link/${id}`);
  return res.data.data;
};
