import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import Link, { ILink } from '../models/Link.js';
import { AppError } from '../utils/AppError.js';
import type { UpdateLinkInput } from '../validators/links.validators.js';

const SLUG_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const generateSlug = customAlphabet(SLUG_ALPHABET, 7);

const baseUrl = (): string => (process.env.BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export interface CreateLinkInput {
  originalUrl: string;
  title?: string;
  slug?: string;
  expiresAt?: Date;
  redirectMode?: 'standard' | 'splash';
  password?: string;
}

export interface LinkDTO {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  clicks: number;
  title: string;
  isActive: boolean;
  redirectMode: 'standard' | 'splash';
  expiresAt: string | null;
  hasPassword: boolean;
  createdAt: string;
}

/**
 * Lazily reconcile a link's `isActive` flag with its expiry: if it is past
 * `expiresAt` but still marked active, flip it off in memory and persist the
 * change (fire-and-forget). Returns whether the link is currently expired.
 */
export const syncExpiryState = (link: ILink): boolean => {
  const expired = link.expiresAt != null && link.expiresAt.getTime() < Date.now();
  if (expired && link.isActive) {
    link.isActive = false;
    Link.updateOne({ _id: link._id }, { isActive: false }).catch((err) =>
      console.error('Error deactivating expired link:', err),
    );
  }
  return expired;
};

const serialize = (link: ILink): LinkDTO => ({
  id: link._id.toString(),
  originalUrl: link.originalUrl,
  shortUrl: link.shortUrl,
  slug: link.slug,
  clicks: link.clicks,
  title: link.title ?? '',
  isActive: link.isActive,
  redirectMode: link.redirectMode,
  expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
  hasPassword: link.passwordHash != null,
  createdAt: link.createdAt.toISOString(),
});

export class LinksService {
  async createLink(userId: string, input: CreateLinkInput): Promise<LinkDTO> {
    const slug = input.slug
      ? await this.claimCustomSlug(input.slug)
      : await this.generateUniqueSlug();

    const link = await Link.create({
      userId,
      originalUrl: input.originalUrl,
      slug,
      shortUrl: `${baseUrl()}/${slug}`,
      title: input.title?.trim() || 'Untitle',
      expiresAt: input.expiresAt ?? null,
      redirectMode: input.redirectMode ?? 'standard',
      passwordHash: input.password ? await bcrypt.hash(input.password, 10) : null,
    });

    return serialize(link);
  }

  async getLink(userId: string, id: string): Promise<LinkDTO> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Link not found');
    }
    const link = await Link.findOne({ _id: id, userId, isArchived: { $ne: true } }).select(
      '+passwordHash',
    );
    if (!link) {
      throw AppError.notFound('Link not found');
    }
    syncExpiryState(link);
    return serialize(link);
  }

  async updateLink(userId: string, id: string, patch: UpdateLinkInput): Promise<LinkDTO> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Link not found');
    }
    const link = await Link.findOne({ _id: id, userId, isArchived: { $ne: true } }).select(
      '+passwordHash',
    );
    if (!link) {
      throw AppError.notFound('Link not found');
    }

    if (patch.title !== undefined) link.title = patch.title.trim() || 'Untitle';
    if (patch.originalUrl !== undefined) link.originalUrl = patch.originalUrl;
    if (patch.status !== undefined) link.isActive = patch.status === 'active';
    if (patch.redirectMode !== undefined) link.redirectMode = patch.redirectMode;
    if (patch.expiresAt !== undefined) {
      link.expiresAt = patch.expiresAt instanceof Date ? patch.expiresAt : null;
    }
    if (patch.password !== undefined) {
      link.passwordHash = patch.password ? await bcrypt.hash(patch.password, 10) : null;
    }

    await link.save();
    return serialize(link);
  }

  async archiveLink(userId: string, id: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Link not found');
    }
    const result = await Link.findOneAndUpdate(
      { _id: id, userId, isArchived: { $ne: true } },
      { isArchived: true, isActive: false },
    );
    if (!result) {
      throw AppError.notFound('Link not found');
    }
  }

  async listLinks(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ links: LinkDTO[]; total: number; page: number; limit: number }> {
    const filter = { userId, isArchived: { $ne: true } };
    const [docs, total] = await Promise.all([
      Link.find(filter)
        .select('+passwordHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Link.countDocuments(filter),
    ]);

    docs.forEach(syncExpiryState);
    return { links: docs.map(serialize), total, page, limit };
  }

  private async claimCustomSlug(slug: string): Promise<string> {
    if (await Link.exists({ slug })) {
      throw AppError.conflict('That slug is already taken', 'SLUG_TAKEN');
    }
    return slug;
  }

  private async generateUniqueSlug(): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const slug = generateSlug();
      if (!(await Link.exists({ slug }))) return slug;
    }
    throw AppError.internal('Could not generate a unique slug, please retry');
  }
}

export const linksService = new LinksService();
