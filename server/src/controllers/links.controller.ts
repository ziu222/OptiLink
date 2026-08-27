import { Request, Response } from 'express';

export class LinksController {
  async createLink(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      success: true,
      message: 'Tạo link thành công (Mock)',
      data: {
        link: {
          id: 'link_123',
          originalUrl: req.body.originalUrl || 'https://example.com',
          shortUrl: 'http://localhost:5000/xyz123',
          slug: 'xyz123',
          clicks: 0
        }
      }
    });
  }

  async getLinks(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách link thành công (Mock)',
      data: {
        links: [
          {
            id: 'link_123',
            originalUrl: 'https://example.com',
            shortUrl: 'http://localhost:5000/xyz123',
            clicks: 10
          }
        ],
        total: 1
      }
    });
  }

  async getLinkById(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin link chi tiết (Mock)',
      data: {
        link: {
          id: req.params.id,
          originalUrl: 'https://example.com',
          shortUrl: 'http://localhost:5000/xyz123'
        }
      }
    });
  }

  async updateLink(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Cập nhật link thành công (Mock)',
      data: {
        link: {
          id: req.params.id,
          ...req.body
        }
      }
    });
  }

  async deleteLink(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Xóa link thành công (Mock)'
    });
  }

  // --- Public Redirect Routes (catch-all) ---
  
  async redirectLink(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      // Import redirectService directly here to avoid circular dependencies if any, 
      // or at the top. Better yet, since we are using TS, let's assume it's imported at the top.
      // But I can't easily add the import via this block. I will just require it locally.
      const { redirectService } = require('../services/redirect.service');
      
      const targetUrl = await redirectService.trackAndGetTargetUrl(slug, req);
      
      if (targetUrl) {
        res.redirect(301, targetUrl);
        return;
      }
      
      res.status(404).send('Link not found');
    } catch (error) {
      console.error('Redirect Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  async verifyLinkProtection(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Xác thực mật khẩu / Captcha thành công (Mock)'
    });
  }
}

export const linksController = new LinksController();
