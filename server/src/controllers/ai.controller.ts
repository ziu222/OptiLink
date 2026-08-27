import { Request, Response } from 'express';

export class AiController {
  async generateMeta(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Tạo meta tag thành công (Mock)',
      data: {
        meta: {
          title: 'Gợi ý Title SEO',
          description: 'Gợi ý Description SEO cực kỳ hấp dẫn do AI sinh ra.',
        }
      }
    });
  }

  async suggestAlias(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Gợi ý alias thành công (Mock)',
      data: {
        suggestions: [
          'link-sieu-toc',
          'rut-gon-nhanh',
          'mien-phi-tot'
        ]
      }
    });
  }
}

export const aiController = new AiController();
