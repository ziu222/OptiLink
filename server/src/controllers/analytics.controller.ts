import { Request, Response } from 'express';

export class AnalyticsController {
  async getOverview(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tổng quan (Mock)',
      data: {
        totalLinks: 10,
        totalClicks: 250,
        clicksToday: 15,
        recentActivity: [
          { linkId: 'link_123', clickedAt: new Date().toISOString() }
        ]
      }
    });
  }

  async getLinkAnalytics(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê cho link chi tiết (Mock)',
      data: {
        linkId: req.params.id,
        totalClicks: 150,
        locations: [{ country: 'VN', clicks: 100 }, { country: 'US', clicks: 50 }],
        devices: [{ device: 'Mobile', clicks: 120 }, { device: 'Desktop', clicks: 30 }]
      }
    });
  }
}

export const analyticsController = new AnalyticsController();
