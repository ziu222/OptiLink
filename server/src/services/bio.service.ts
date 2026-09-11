import BioPage, { IBioPage } from '../models/BioPage';
import { linksService } from './links.service.js';

export class BioService {
  /**
   * Lấy trang Bio của User bằng UserId
   */
  async getBioByUserId(userId: string): Promise<IBioPage | null> {
    return await BioPage.findOne({ userId });
  }

  /**
   * Lấy trang Bio công khai bằng Username
   */
  async getBioByUsername(username: string): Promise<IBioPage | null> {
    return await BioPage.findOne({ username, isActive: true });
  }

  /**
   * Tạo hoặc Cập nhật trang Bio
   * Tích hợp tự động tạo Short Link cho các thẻ PRODUCT_CARD
   */
  async upsertBio(userId: string, bioData: Partial<IBioPage>, userEmail?: string): Promise<IBioPage> {
    // 1. Tiền xử lý các blocks để tự động tạo Short Link cho Affiliate Products & Custom Links
    if (bioData.blocks && Array.isArray(bioData.blocks)) {
      for (const block of bioData.blocks) {
        if ((block.type === 'PRODUCT_CARD' || block.type === 'LINK') && block.content) {
          // Bio blocks use the same stored-link library as the dashboard and QR tools.
          const destination = block.content.originalUrl || block.content.url;
          if (!block.content.shortLinkId && destination) {
            const newLink = await linksService.createLink(userId, {
              originalUrl: destination,
              title: block.content.title || block.content.label || 'Bio Page link',
            });
            block.content.shortLinkId = newLink.id;
            block.content.clickUrl = newLink.shortUrl;
          }
        }
      }
    }

    // 2. Lưu vào Database
    const existingBio = await BioPage.findOne({ userId });
    
    if (existingBio) {
      // Cập nhật
      return await BioPage.findOneAndUpdate(
        { userId },
        { $set: bioData },
        { new: true, runValidators: true }
      ).exec() as IBioPage;
    } else {
      // Tạo mới: cần username duy nhất nếu client chưa cung cấp
      const username = bioData.username || await this.generateUsername(userEmail || userId);
      const newBio = new BioPage({
        ...bioData,
        userId,
        username
      });
      return await newBio.save();
    }
  }

  /**
   * Sinh username duy nhất từ email (hoặc userId) khi user chưa chọn username
   */
  private async generateUsername(seed: string): Promise<string> {
    const base = seed.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '').toLowerCase() || 'user';
    let candidate = base;
    let suffix = 0;
    while (await BioPage.exists({ username: candidate })) {
      suffix += 1;
      candidate = `${base}${suffix}`;
    }
    return candidate;
  }

  /**
   * Xóa trang Bio
   */
  async deleteBio(userId: string): Promise<boolean> {
    const result = await BioPage.deleteOne({ userId });
    return result.deletedCount === 1;
  }
}

export const bioService = new BioService();
