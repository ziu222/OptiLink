import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import type { AnalyticsRangeQuery } from '../validators/analytics.validators.js';

export class AnalyticsController {
  async getOverview(req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getOverview(req.user!.id);
    res.status(200).json({
      success: true,
      message: 'Overview retrieved successfully',
      data,
    });
  }

  async getLinkAnalytics(req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getLinkAnalytics(
      req.user!.id,
      req.params.id as string,
      req.query as unknown as AnalyticsRangeQuery,
    );
    res.status(200).json({
      success: true,
      message: 'Link analytics retrieved successfully',
      data,
    });
  }
}

export const analyticsController = new AnalyticsController();
