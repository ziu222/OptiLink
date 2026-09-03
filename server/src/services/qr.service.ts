import QRCode from 'qrcode';
import sharp from 'sharp';
import axios from 'axios';
import mongoose from 'mongoose';
import QRCodeModel, { IQRCode, IQRConfig } from '../models/QRCode.js';
import User from '../models/User.js';
import { CreateQrInput } from '../validators/qr.validator.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

export class QrService {
  /**
   * Sinh mã QR và lưu cấu hình vào Database
   */
  async createQr(userId: string, input: CreateQrInput): Promise<IQRCode> {
    // 1. Kiểm tra Tier limits (FREE tối đa 10 QR codes)
    const user = await User.findById(userId).select('tier');
    if (!user) {
      throw AppError.unauthorized('Người dùng không tồn tại');
    }

    if (user.tier === 'FREE') {
      const currentCount = await QRCodeModel.countDocuments({ userId });
      if (currentCount >= 10) {
        throw AppError.forbidden(
          'Tài khoản FREE chỉ được tạo tối đa 10 mã QR. Vui lòng nâng cấp gói PREMIUM để tạo không giới hạn!'
        );
      }
    }

    // 2. Chuẩn hóa config
    const rawConfig = input.config || {};
    const hasLogo = Boolean(rawConfig.logoUrl);

    const config: IQRConfig = {
      fgColor: rawConfig.fgColor || '#000000',
      bgColor: rawConfig.bgColor || '#ffffff',
      logoUrl: rawConfig.logoUrl || null,
      eyeType: rawConfig.eyeType || 'square',
      dotType: rawConfig.dotType || 'square',
      size: rawConfig.size || 512,
      // Khi có logo ở giữa, bắt buộc dùng Error Correction Level 'H' (30%) để quét ổn định
      errorCorrectionLevel: hasLogo ? 'H' : (rawConfig.errorCorrectionLevel || 'M'),
    };

    // 3. Sinh preview base64 nhỏ (256px) để hiển thị nhanh trên Dashboard
    let previewUrl = '';
    try {
      previewUrl = await this.renderBase64Preview(input.targetUrl, config);
    } catch (err: any) {
      logger.warn(`Lỗi khi tạo preview QR: ${err.message}`);
    }

    // 4. Lưu vào MongoDB
    const qrCode = new QRCodeModel({
      userId,
      linkId: input.linkId ? new mongoose.Types.ObjectId(input.linkId) : null,
      title: input.title || 'My QR Code',
      targetUrl: input.targetUrl,
      config,
      previewUrl,
    });

    await qrCode.save();
    return qrCode;
  }

  /**
   * Lấy danh sách mã QR của người dùng
   */
  async getUserQrs(userId: string): Promise<IQRCode[]> {
    return await QRCodeModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate('linkId', 'slug shortUrl clicks');
  }

  /**
   * Lấy chi tiết 1 mã QR
   */
  async getQrById(id: string, userId: string): Promise<IQRCode> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('ID mã QR không hợp lệ');
    }

    const qr = await QRCodeModel.findOne({ _id: id, userId });
    if (!qr) {
      throw AppError.notFound('Không tìm thấy mã QR hoặc bạn không có quyền truy cập');
    }

    return qr;
  }

  /**
   * Tạo buffer ảnh (PNG hoặc SVG) phục vụ tải về chất lượng cao
   */
  async generateDownload(
    id: string,
    userId: string,
    format: 'png' | 'svg' = 'png',
    sizeOverride?: number
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    const qr = await this.getQrById(id, userId);

    const size = sizeOverride || qr.config.size || 512;
    const { fgColor, bgColor, logoUrl, errorCorrectionLevel } = qr.config;
    const safeTitle = (qr.title || 'optilink-qr')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');

    if (format === 'svg') {
      const svgString = await QRCode.toString(qr.targetUrl, {
        type: 'svg',
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: logoUrl ? 'H' : errorCorrectionLevel,
      });

      return {
        buffer: Buffer.from(svgString, 'utf-8'),
        mimeType: 'image/svg+xml',
        filename: `${safeTitle}-${size}px.svg`,
      };
    }

    // Format PNG
    let qrPngBuffer = await QRCode.toBuffer(qr.targetUrl, {
      type: 'png',
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: logoUrl ? 'H' : errorCorrectionLevel,
    });

    // Nếu có logo, dùng Sharp chèn logo vào tâm QR code
    if (logoUrl) {
      try {
        qrPngBuffer = await this.compositeLogo(qrPngBuffer, logoUrl, size);
      } catch (err: any) {
        logger.warn(`Không thể chèn logo vào QR: ${err.message}`);
        // Tiếp tục trả về QR gốc nếu logo bị lỗi tải
      }
    }

    return {
      buffer: qrPngBuffer,
      mimeType: 'image/png',
      filename: `${safeTitle}-${size}px.png`,
    };
  }

  /**
   * Xóa mã QR
   */
  async deleteQr(id: string, userId: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.badRequest('ID mã QR không hợp lệ');
    }

    const result = await QRCodeModel.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      throw AppError.notFound('Không tìm thấy mã QR để xóa');
    }

    return true;
  }

  /**
   * Sinh ảnh preview Base64 nhỏ để client hiển thị trực tiếp
   */
  private async renderBase64Preview(targetUrl: string, config: IQRConfig): Promise<string> {
    const previewSize = 256;
    let buffer = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: previewSize,
      margin: 2,
      color: {
        dark: config.fgColor,
        light: config.bgColor,
      },
      errorCorrectionLevel: config.logoUrl ? 'H' : config.errorCorrectionLevel,
    });

    if (config.logoUrl) {
      try {
        buffer = await this.compositeLogo(buffer, config.logoUrl, previewSize);
      } catch (err: any) {
        logger.warn(`Preview logo composite error: ${err.message}`);
      }
    }

    return `data:image/png;base64,${buffer.toString('base64')}`;
  }

  /**
   * Dùng Sharp tải và ghép logo vào giữa mã QR
   */
  private async compositeLogo(qrBuffer: Buffer, logoUrl: string, qrSize: number): Promise<Buffer> {
    // 1. Tải ảnh logo từ URL
    const response = await axios.get(logoUrl, {
      responseType: 'arraybuffer',
      timeout: 6000,
      headers: {
        'User-Agent': 'OptiLink-QRGenerator/1.0',
      },
    });
    const logoRawBuffer = Buffer.from(response.data);

    // 2. Kích thước logo tối ưu: khoảng 22% kích thước QR
    const logoSize = Math.round(qrSize * 0.22);
    const badgePadding = Math.max(4, Math.round(logoSize * 0.12));
    const badgeSize = logoSize + badgePadding * 2;
    const borderRadius = Math.round(badgeSize * 0.15);

    // 3. Tạo khung nền trắng bo góc nhẹ (Badge) để bảo vệ logo không bị nét QR đè
    const badgeSvg = `
      <svg width="${badgeSize}" height="${badgeSize}">
        <rect width="${badgeSize}" height="${badgeSize}" rx="${borderRadius}" ry="${borderRadius}" fill="#ffffff" />
      </svg>
    `;
    const badgeBuffer = Buffer.from(badgeSvg);

    // 4. Resize ảnh logo
    const resizedLogo = await sharp(logoRawBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toBuffer();

    // 5. Ghép logo lên giữa badge trắng
    const combinedBadge = await sharp(badgeBuffer)
      .composite([
        {
          input: resizedLogo,
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer();

    // 6. Ghép Badge lên giữa mã QR
    const finalQr = await sharp(qrBuffer)
      .composite([
        {
          input: combinedBadge,
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer();

    return finalQr;
  }
}

export const qrService = new QrService();
