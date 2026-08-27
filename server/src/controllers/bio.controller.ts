import { Request, Response } from 'express';

export class BioController {
  async createBio(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      success: true,
      message: 'Tạo trang Bio thành công (Mock)',
      data: {
        bio: {
          id: 'bio_123',
          slug: req.body.slug || 'my-bio',
          title: req.body.title || 'My Bio Page',
          blocks: req.body.blocks || []
        }
      }
    });
  }

  async getBioForUser(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy trang Bio của user thành công (Mock)',
      data: {
        bio: {
          id: 'bio_123',
          slug: 'my-bio',
          title: 'My Bio Page',
          blocks: []
        }
      }
    });
  }

  async getBioBySlug(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy thông tin trang Bio công khai (Mock)',
      data: {
        bio: {
          id: 'bio_123',
          slug: req.params.slug,
          title: 'My Public Bio',
          blocks: [{ type: 'link', content: 'https://example.com' }]
        }
      }
    });
  }

  async updateBio(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Cập nhật trang Bio thành công (Mock)',
      data: {
        bio: {
          id: req.params.id,
          ...req.body
        }
      }
    });
  }

  async deleteBio(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Xóa trang Bio thành công (Mock)'
    });
  }
}

export const bioController = new BioController();
