import Link from '../models/Link';
import Analytics from '../models/Analytics';
import { Request } from 'express';
import useragent from 'useragent';

export class RedirectService {
  
  /**
   * Theo dõi click và lấy URL đích
   */
  async trackAndGetTargetUrl(slug: string, req: Request): Promise<string | null> {
    const link = await Link.findOne({ slug, isActive: true });
    
    if (!link) {
      return null;
    }

    // 1. Phân tích Request (IP, Thiết bị)
    const userAgentString = req.headers['user-agent']?.toString() || '';
    const isMobile = /mobile|iphone|ipod|android.*mobile|windows.*phone/i.test(userAgentString);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgentString);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const referrer = req.get('Referrer') || '';

    // 2. Ghi nhận Analytics không chặn luồng chính (Lưu bất đồng bộ)
    const analytics = new Analytics({
      linkId: link._id,
      ipAddress,
      userAgent: req.headers['user-agent']?.toString() || 'unknown',
      deviceType,
      referrer
    });
    
    // Fire and forget (Tối ưu tốc độ Redirect)
    analytics.save().catch(err => console.error('Error saving analytics:', err));
    
    // 3. Tăng biến đếm Clicks
    Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }).catch(err => console.error('Error updating clicks:', err));

    return link.originalUrl;
  }
}

export const redirectService = new RedirectService();
