import bcrypt from 'bcryptjs';
import Link, { ILink } from '../models/Link';
import Analytics from '../models/Analytics';
import { syncExpiryState } from './links.service';
import { Request } from 'express';

export class RedirectService {
  /**
   * Look up an active, non-expired link by slug. No side effects.
   * `passwordHash` is selected so callers can gate on it.
   */
  async getActiveLink(slug: string): Promise<ILink | null> {
    const link = await Link.findOne({ slug, isActive: true, isArchived: { $ne: true } }).select(
      '+passwordHash',
    );
    if (!link) return null;
    if (syncExpiryState(link)) return null;
    return link;
  }

  /** Compare a plaintext password against a link's stored hash. */
  async verifyPassword(link: ILink, password: string): Promise<boolean> {
    return bcrypt.compare(password, link.passwordHash ?? '');
  }

  /**
   * Record a click: write an Analytics doc and bump the click counter.
   * Fire-and-forget — never blocks the redirect.
   */
  recordHit(link: ILink, req: Request): void {
    const userAgentString = req.headers['user-agent']?.toString() || '';
    const isMobile = /mobile|iphone|ipod|android.*mobile|windows.*phone/i.test(userAgentString);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgentString);
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const referrer = req.get('Referrer') || '';

    const analytics = new Analytics({
      linkId: link._id,
      ipAddress,
      userAgent: userAgentString || 'unknown',
      deviceType,
      referrer,
    });

    analytics.save().catch((err) => console.error('Error saving analytics:', err));
    Link.updateOne({ _id: link._id }, { $inc: { clicks: 1 } }).catch((err) =>
      console.error('Error updating clicks:', err),
    );
  }
}

export const redirectService = new RedirectService();
