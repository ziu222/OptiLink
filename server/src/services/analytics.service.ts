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

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Short link',
  qr: 'QR code',
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
  clicksToday: number;
  locations: { country: string; clicks: number }[];
  devices: { device: string; clicks: number }[];
  sources: { source: string; clicks: number }[];
}

const HOUR_MS = 3_600_000;
const WINDOW_HOURS = 24;

export const emptyHourlySeries = (): number[] => new Array(WINDOW_HOURS).fill(0);

/** Fold hourly aggregation rows into per-link, zero-filled 24-slot arrays. Pure. */
export function bucketHourlyRows(
  rows: Array<{ linkId: string; bucketMs: number; count: number }>,
  sinceMs: number,
): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const row of rows) {
    const series = (out[row.linkId] ??= emptyHourlySeries());
    const idx = Math.floor((row.bucketMs - sinceMs) / HOUR_MS);
    if (idx >= 0 && idx < WINDOW_HOURS) series[idx] += row.count;
  }
  return out;
}

/**
 * Rolling 24h hourly click counts per link, hour-aligned to UTC (matching
 * `$dateTrunc`'s default), ordered oldest -> newest. Links with no clicks in the
 * window are absent from the result; callers zero-fill with `emptyHourlySeries`.
 */
export async function getHourlyClickSeries(
  linkIds: Array<string | mongoose.Types.ObjectId>,
): Promise<Record<string, number[]>> {
  if (linkIds.length === 0) return {};

  const objectIds = linkIds.map((id) =>
    typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id,
  );
  const nowHourMs = Math.floor(Date.now() / HOUR_MS) * HOUR_MS;
  const sinceMs = nowHourMs - (WINDOW_HOURS - 1) * HOUR_MS;

  const rows = await Analytics.aggregate<{
    _id: { linkId: mongoose.Types.ObjectId; bucket: Date };
    count: number;
  }>([
    { $match: { linkId: { $in: objectIds }, createdAt: { $gte: new Date(sinceMs) } } },
    {
      $group: {
        _id: {
          linkId: '$linkId',
          bucket: { $dateTrunc: { date: '$createdAt', unit: 'hour' } },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return bucketHourlyRows(
    rows.map((row) => ({
      linkId: row._id.linkId.toString(),
      bucketMs: row._id.bucket.getTime(),
      count: row.count,
    })),
    sinceMs,
  );
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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalClicks, clicksToday, locations, devices, sources] = await Promise.all([
      Analytics.countDocuments(match),
      Analytics.countDocuments({ linkId: link._id, createdAt: { $gte: startOfToday } }),
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
      Analytics.aggregate([
        { $match: match },
        // Older logs predate the `source` field — treat them as direct visits.
        { $group: { _id: { $ifNull: ['$source', 'direct'] }, clicks: { $sum: 1 } } },
        { $sort: { clicks: -1 } },
      ]),
    ]);

    return {
      linkId: link._id.toString(),
      totalClicks,
      clicksToday,
      locations: locations.map((row) => ({ country: row._id ?? 'unknown', clicks: row.clicks })),
      devices: devices.map((row) => ({
        device: DEVICE_LABELS[row._id as string] ?? 'Unknown',
        clicks: row.clicks,
      })),
      sources: sources.map((row) => ({
        source: SOURCE_LABELS[row._id as string] ?? SOURCE_LABELS.direct,
        clicks: row.clicks,
      })),
    };
  }
}

export const analyticsService = new AnalyticsService();
