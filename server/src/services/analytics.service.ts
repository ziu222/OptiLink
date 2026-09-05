import mongoose from 'mongoose';
import Analytics, { IAnalytics } from '../models/Analytics.js';
import Link from '../models/Link.js';
import { AppError } from '../utils/AppError.js';
import type { AnalyticsRangeQuery } from '../validators/analytics.validators.js';

const DEVICE_LABELS: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet',
  unknown: 'Unknown',
};

export interface RecentActivityDTO {
  linkId: string;
  clickedAt: string;
}

export interface OverviewDTO {
  totalLinks: number;
  totalClicks: number;
  clicksToday: number;
  recentActivity: RecentActivityDTO[];
}

export interface LinkAnalyticsDTO {
  linkId: string;
  totalClicks: number;
  locations: { country: string; clicks: number }[];
  devices: { device: string; clicks: number }[];
}

export class AnalyticsService {
  async getOverview(userId: string): Promise<OverviewDTO> {
    const linkFilter = { userId, isArchived: { $ne: true } };
    const linkIds = await Link.find(linkFilter).distinct('_id');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalLinks, totalClicksAgg, clicksToday, recent] = await Promise.all([
      Link.countDocuments(linkFilter),
      Link.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isArchived: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$clicks' } } },
      ]),
      Analytics.countDocuments({ linkId: { $in: linkIds }, createdAt: { $gte: startOfToday } }),
      Analytics.find({ linkId: { $in: linkIds } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('linkId createdAt'),
    ]);

    return {
      totalLinks,
      totalClicks: totalClicksAgg[0]?.total ?? 0,
      clicksToday,
      recentActivity: recent.map((doc) => ({
        linkId: doc.linkId.toString(),
        clickedAt: doc.createdAt.toISOString(),
      })),
    };
  }

  async getLinkAnalytics(
    userId: string,
    linkId: string,
    range: AnalyticsRangeQuery,
  ): Promise<LinkAnalyticsDTO> {
    if (!mongoose.isValidObjectId(linkId)) {
      throw AppError.notFound('Link not found');
    }
    const link = await Link.findOne({ _id: linkId, userId, isArchived: { $ne: true } });
    if (!link) {
      throw AppError.notFound('Link not found');
    }

    const match: mongoose.FilterQuery<IAnalytics> = { linkId: link._id };
    if (range.from || range.to) {
      match.createdAt = {};
      if (range.from) match.createdAt.$gte = range.from;
      if (range.to) match.createdAt.$lte = range.to;
    }

    const [totalClicks, locations, devices] = await Promise.all([
      Analytics.countDocuments(match),
      Analytics.aggregate([
        { $match: match },
        { $group: { _id: '$country', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
      ]),
      Analytics.aggregate([
        { $match: match },
        { $group: { _id: '$deviceType', clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
      ]),
    ]);

    return {
      linkId: link._id.toString(),
      totalClicks,
      locations: locations.map((row) => ({ country: row._id ?? 'unknown', clicks: row.clicks })),
      devices: devices.map((row) => ({
        device: DEVICE_LABELS[row._id as string] ?? 'Unknown',
        clicks: row.clicks,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
