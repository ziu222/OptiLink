import BioPage, { IBioPage } from '../models/BioPage';
import Link from '../models/Link.js';
import { linksService } from './links.service.js';
import { AppError } from '../utils/AppError.js';

const frontendUrl = (): string =>
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

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
    let bio: IBioPage;

    if (existingBio) {
      // Cập nhật
      bio = await BioPage.findOneAndUpdate(
        { userId },
        { $set: bioData },
        { new: true, runValidators: true }
      ).exec() as IBioPage;
    } else {
      // Tạo mới: cần username duy nhất nếu client chưa cung cấp
      const username = bioData.username || await this.generateUsername(userEmail || userId);
      bio = await new BioPage({
        ...bioData,
        userId,
        username
      }).save();
    }

    // 3. Đảm bảo bio page có 1 shortened link công khai (hiện trong danh sách
    // Shortened Links như link thường), trỏ tới đúng địa chỉ /:username hiện tại.
    await this.syncShortLink(bio, userId);
    return bio;
  }

  /**
   * Tạo (lần đầu publish) hoặc cập nhật destination của shortened link gắn
   * với bio page, để `opti.link/<slug>` luôn dẫn tới đúng bio page hiện tại.
   */
  private async syncShortLink(bio: IBioPage, userId: string): Promise<void> {
    const destination = `${frontendUrl()}/${bio.username}`;

    if (bio.shortLinkId) {
      await Link.updateOne({ _id: bio.shortLinkId }, { originalUrl: destination });
      return;
    }

    let newLink;
    try {
      newLink = await linksService.createLink(userId, {
        originalUrl: destination,
        title: bio.title || 'Bio Page',
        slug: bio.username,
      });
    } catch (err) {
      if (err instanceof AppError && err.code === 'SLUG_TAKEN') {
        // Someone else already holds that slug on the shortened-links side —
        // fall back to an auto-generated one rather than failing the publish.
        newLink = await linksService.createLink(userId, {
          originalUrl: destination,
          title: bio.title || 'Bio Page',
        });
      } else {
        throw err;
      }
    }

    bio.shortLinkId = newLink.id as unknown as IBioPage['shortLinkId'];
    await BioPage.updateOne({ _id: bio._id }, { shortLinkId: newLink.id });
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
