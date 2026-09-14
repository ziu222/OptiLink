import { Request, Response } from 'express';
import { adminService } from '../services/admin.service.js';
import type {
  BanUserInput,
  ListAdminLinksQuery,
  ListUsersQuery,
  UpdateAdminLinkInput,
  UpdateUserInput,
} from '../validators/admin.validators.js';

export class AdminController {
  // ── Stats ──────────────────────────────────────────────────────────

  async getGlobalStats(req: Request, res: Response): Promise<void> {
    const stats = await adminService.getGlobalStats();
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê toàn hệ thống thành công',
      data: stats,
    });
  }

  async getGrowthStats(req: Request, res: Response): Promise<void> {
    const growth = await adminService.getGrowthStats();
    res.status(200).json({
      success: true,
      message: 'Lấy thống kê tăng trưởng thành công',
      data: { growth },
    });
  }

  // ── Users ──────────────────────────────────────────────────────────

  async getUsers(req: Request, res: Response): Promise<void> {
    const data = await adminService.listUsers(req.query as unknown as ListUsersQuery);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách users thành công',
      data,
    });
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const user = await adminService.getUserById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: { user },
    });
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    const user = await adminService.updateUser(
      req.user!.id,
      req.params.id as string,
      req.body as UpdateUserInput,
    );
    res.status(200).json({
      success: true,
      message: 'Cập nhật user thành công',
      data: { user },
    });
  }

  async banUser(req: Request, res: Response): Promise<void> {
    const { isBanned } = req.body as BanUserInput;
    const user = await adminService.banUser(req.user!.id, req.params.id as string, isBanned);
    res.status(200).json({
      success: true,
      message: isBanned ? 'Đã khóa user' : 'Đã mở khóa user',
      data: { user },
    });
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    await adminService.deleteUser(req.user!.id, req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Xóa user thành công',
    });
  }

  // ── Links ──────────────────────────────────────────────────────────

  async getLinks(req: Request, res: Response): Promise<void> {
    const data = await adminService.listLinks(req.query as unknown as ListAdminLinksQuery);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách liên kết thành công',
      data,
    });
  }

  async getLinkById(req: Request, res: Response): Promise<void> {
    const link = await adminService.getLinkById(req.params.id as string);
    res.status(200).json({
      success: true,
      data: { link },
    });
  }

  async updateLink(req: Request, res: Response): Promise<void> {
    const link = await adminService.updateLink(
      req.params.id as string,
      req.body as UpdateAdminLinkInput,
    );
    res.status(200).json({
      success: true,
      message: 'Cập nhật liên kết thành công',
      data: { link },
    });
  }

  async deleteLink(req: Request, res: Response): Promise<void> {
    await adminService.deleteLink(req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Xóa liên kết thành công',
    });
  }

  // ── Content (not yet implemented — mock only) ─────────────────────

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

  // ── AI Monitoring (not yet implemented — mock only) ────────────────

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
