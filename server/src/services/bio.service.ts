import BioPage, { IBioPage } from '../models/BioPage';
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
    // 1. Tiền xử lý các blocks để tự động tạo Short Link cho Affiliate Products
    if (bioData.blocks && Array.isArray(bioData.blocks)) {
      for (const block of bioData.blocks) {
        if (block.type === 'PRODUCT_CARD') {
          // Giả lập logic: Nếu thẻ sản phẩm chưa có link rút gọn, tạo mới ngầm
          if (!block.content.shortLinkId && block.content.originalUrl) {
            // TODO: Tích hợp gọi sang LinkService thực tế ở đây
            // const shortLink = await LinkService.createShortLink(userId, block.content.originalUrl);
            const mockShortId = new mongoose.Types.ObjectId().toHexString();
            const mockSlug = uuidv4().substring(0, 6);
            
            block.content.shortLinkId = mockShortId;
            block.content.clickUrl = `https://opti.link/s/${mockSlug}`;
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
