import { Request, Response } from 'express';
import { bioService } from '../services/bio.service';

export class BioController {
  
  /**
   * Tạo hoặc Cập nhật Bio Page (Owner Panel)
   */
  async createOrUpdateBio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const bioData = req.body;
      const updatedBio = await bioService.upsertBio(userId, bioData, req.user?.email);

      res.status(200).json({
        success: true,
        message: 'Lưu trang Bio thành công',
        data: { bio: updatedBio }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Upload ảnh (Avatar / Banner)
   */
  async uploadMedia(req: Request, res: Response): Promise<void> {
    try {
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
      }

      const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Upload thành công',
        data: { url }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Lấy trang Bio cho User chỉnh sửa (Owner Panel)
   */
  async getBioForUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const bio = await bioService.getBioByUserId(userId);
      
      if (!bio) {
        res.status(404).json({ success: false, message: 'Bio page not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: { bio }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Lấy trang Bio công khai bằng username (Khách hàng truy cập)
   */
  async getBioByUsername(req: Request, res: Response): Promise<void> {
    try {
      const username = req.params.username as string;
      const bio = await bioService.getBioByUsername(username);

      if (!bio) {
        res.status(404).json({ success: false, message: 'Bio page not found or inactive' });
        return;
      }

      res.status(200).json({
        success: true,
        data: { bio }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Xóa trang Bio (Owner Panel)
   */
  async deleteBio(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const success = await bioService.deleteBio(userId);

      if (!success) {
        res.status(404).json({ success: false, message: 'Bio page not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Xóa trang Bio thành công'
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

export const bioController = new BioController();
