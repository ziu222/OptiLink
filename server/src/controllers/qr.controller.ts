import { Request, Response, NextFunction } from 'express';
import { qrService } from '../services/qr.service.js';
import { AppError } from '../utils/AppError.js';

export class QrController {
  /**
   * Tạo mã QR mới
   * POST /api/qr/generate
   */
  async generateQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw AppError.unauthorized('Bạn cần đăng nhập để tạo mã QR');
      }

      const qr = await qrService.createQr(userId, req.body);

      res.status(201).json({
        success: true,
        message: 'Tạo mã QR thành công',
        data: { qr },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy danh sách mã QR của user đang đăng nhập
   * GET /api/qr/list
   */
  async getQrList(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw AppError.unauthorized('Bạn cần đăng nhập');
      }

      const qrCodes = await qrService.getUserQrs(userId);

      res.status(200).json({
        success: true,
        data: { qrCodes },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lấy chi tiết 1 mã QR
   * GET /api/qr/:id
   */
  async getQrById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw AppError.unauthorized('Bạn cần đăng nhập');
      }

      const qr = await qrService.getQrById(req.params.id, userId);

      res.status(200).json({
        success: true,
        data: { qr },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Tải xuống mã QR (PNG hoặc SVG)
   * GET /api/qr/:id/download
   */
  async downloadQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw AppError.unauthorized('Bạn cần đăng nhập để tải mã QR');
      }

      const format = (req.query.format as 'png' | 'svg') || 'png';
      const sizeOverride = req.query.size ? Number(req.query.size) : undefined;

      const fileData = await qrService.generateDownload(
        req.params.id,
        userId,
        format,
        sizeOverride
      );

      res.setHeader('Content-Type', fileData.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
      res.setHeader('Content-Length', fileData.buffer.length);

      res.end(fileData.buffer);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Xóa mã QR
   * DELETE /api/qr/:id
   */
  async deleteQr(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw AppError.unauthorized('Bạn cần đăng nhập');
      }

      await qrService.deleteQr(req.params.id, userId);

      res.status(200).json({
        success: true,
        message: 'Mã QR đã được xóa thành công',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const qrController = new QrController();
