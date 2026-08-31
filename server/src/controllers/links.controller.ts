import { Request, Response } from 'express';
import { linksService } from '../services/links.service.js';
import { redirectService } from '../services/redirect.service.js';
import { AppError } from '../utils/AppError.js';

export class LinksController {
  async createLink(req: Request, res: Response): Promise<void> {
    const link = await linksService.createLink(req.user!.id, req.body);
    res.status(201).json({
      success: true,
      message: 'Link created successfully',
      data: { link },
    });
  }

  async getLinks(req: Request, res: Response): Promise<void> {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const data = await linksService.listLinks(req.user!.id, page, limit);
    res.status(200).json({
      success: true,
      message: 'Links retrieved successfully',
      data,
    });
  }

  async getLinkById(req: Request, res: Response): Promise<void> {
    const link = await linksService.getLink(req.user!.id, req.params.id as string);
    res.status(200).json({
      success: true,
      message: 'Link retrieved successfully',
      data: { link },
    });
  }

  async updateLink(req: Request, res: Response): Promise<void> {
    const link = await linksService.updateLink(req.user!.id, req.params.id as string, req.body);
    res.status(200).json({
      success: true,
      message: 'Link updated successfully',
      data: { link },
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
      const slug = req.params.slug as string;
      const link = await redirectService.getActiveLink(slug);

      if (!link) {
        res.status(404).send('Link not found');
        return;
      }

      if (link.passwordHash) {
        const base = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
        res.redirect(302, `${base}/s/${encodeURIComponent(slug)}`);
        return;
      }

      redirectService.recordHit(link, req);
      res.redirect(301, link.originalUrl);
    } catch (error) {
      console.error('Redirect Error:', error);
      res.status(500).send('Internal Server Error');
    }
  }

  async verifyLinkProtection(req: Request, res: Response): Promise<void> {
    const slug = req.params.slug as string;
    const { password } = req.body as { password: string };

    const link = await redirectService.getActiveLink(slug);
    if (!link) {
      throw AppError.notFound('Link not found');
    }
    if (link.passwordHash && !(await redirectService.verifyPassword(link, password))) {
      throw AppError.unauthorized('Incorrect password', 'INVALID_PASSWORD');
    }

    redirectService.recordHit(link, req);
    res.status(200).json({
      success: true,
      data: { originalUrl: link.originalUrl },
    });
  }
}

export const linksController = new LinksController();
