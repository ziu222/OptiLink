import { Request, Response } from 'express';

export class AdminController {
  // ── Stats ──────────────────────────────────────────────────────────

  async getGlobalStats(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê toàn hệ thống thành công (Mock)',
      data: {
        totalUsers: 1500,
        totalLinks: 45000,
        totalClicks: 1200000,
        activeUsersToday: 200
      }
    });
  }

  async getGrowthStats(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tăng trưởng thành công (Mock)',
      data: {
        growth: [
          { date: '2026-08-01', newUsers: 10, newLinks: 150 },
          { date: '2026-08-02', newUsers: 12, newLinks: 165 }
        ]
      }
    });
  }

  // ── Users ──────────────────────────────────────────────────────────

  async getUsers(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách users (Mock)',
      data: {
        users: [
          { id: 'user_1', email: 'user1@example.com', role: 'user', tier: 'FREE', isBanned: false },
          { id: 'user_2', email: 'user2@example.com', role: 'user', tier: 'PREMIUM', isBanned: true }
        ],
        total: 2
      }
    });
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        user: { id: req.params.id, email: 'user@example.com', role: 'user' }
      }
    });
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Cập nhật user thành công (Mock)'
    });
  }

  async banUser(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Khóa / Mở khóa user thành công (Mock)'
    });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Xóa user thành công (Mock)'
    });
  }

  // ── Content ────────────────────────────────────────────────────────

  async getContentList(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách nội dung (Mock)',
      data: {
        content: [
          { type: 'link', id: 'link_1', flagged: true }
        ]
      }
    });
  }

  async deleteContent(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: `Xóa nội dung ${req.params.type} thành công (Mock)`
    });
  }

  // ── AI Monitoring ──────────────────────────────────────────────────

  async getAiStats(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê AI (Mock)',
      data: {
        totalRequestsToday: 450,
        averageLatency: '1.2s'
      }
    });
  }

  async clearAiCache(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Xóa cache AI thành công (Mock)'
    });
  }
}

export const adminController = new AdminController();
