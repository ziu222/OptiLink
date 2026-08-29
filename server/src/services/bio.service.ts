import BioPage, { IBioPage } from '../models/BioPage';
import Link from '../models/Link';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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
  async upsertBio(userId: string, bioData: Partial<IBioPage>): Promise<IBioPage> {
    // 1. Tiền xử lý các blocks để tự động tạo Short Link cho Affiliate Products & Custom Links
    if (bioData.blocks && Array.isArray(bioData.blocks)) {
      for (const block of bioData.blocks) {
        if ((block.type === 'PRODUCT_CARD' || block.type === 'LINK') && block.content) {
          // Nếu có link gốc mà chưa có shortLinkId, tạo mới Link trong DB
          if (!block.content.shortLinkId && block.content.originalUrl) {
            const mockSlug = uuidv4().substring(0, 6); // Rút gọn UUID làm slug ngẫu nhiên
            const shortUrl = `https://opti.link/s/${mockSlug}`; // Tùy biến domain theo env sau

            const newLink = new Link({
              userId,
              originalUrl: block.content.originalUrl,
              slug: mockSlug,
              shortUrl
            });
            await newLink.save();

            block.content.shortLinkId = newLink._id.toString();
            block.content.clickUrl = shortUrl;
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
      // Tạo mới
      const newBio = new BioPage({
        ...bioData,
        userId
      });
      return await newBio.save();
    }
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
