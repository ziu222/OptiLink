import { Request, Response } from 'express';

export class QrController {
  async generateQr(req: Request, res: Response): Promise<void> {
    res.status(201).json({
      success: true,
      message: 'Tạo QR code thành công (Mock)',
      data: {
        qrCode: {
          id: 'qr_123',
          linkId: req.body.linkId || null,
          imageUrl: 'http://localhost:5000/mock-qr.png'
        }
      }
    });
  }

  async getQrList(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách QR code thành công (Mock)',
      data: {
        qrCodes: [
          {
            id: 'qr_123',
            linkId: 'link_123',
            imageUrl: 'http://localhost:5000/mock-qr.png'
          }
        ]
      }
    });
  }

  async downloadQr(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Đang tải xuống QR code (Mock)',
      data: {
        downloadUrl: 'http://localhost:5000/mock-qr.png'
      }
    });
  }

  async deleteQr(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Xóa QR code thành công (Mock)'
    });
  }
}

export const qrController = new QrController();
