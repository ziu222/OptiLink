import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User.js';
import Link, { ILink } from '../models/Link.js';
import { AppError } from '../utils/AppError.js';
import type {
  ListAdminLinksQuery,
  ListUsersQuery,
  UpdateAdminLinkInput,
  UpdateUserInput,
} from '../validators/admin.validators.js';

const GROWTH_WINDOW_DAYS = 30;

const escapeRegex = (input: string): string => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export interface GlobalStatsDTO {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  freeUsers: number;
  premiumUsers: number;
}

export interface GrowthPointDTO {
  date: string;
  newUsers: number;
  newLinks: number;
}

export interface AdminUserDTO {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'user' | 'admin';
  tier: 'FREE' | 'PREMIUM';
  isVerified: boolean;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminLinkDTO {
  id: string;
  title: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  clicks: number;
  isActive: boolean;
  redirectMode: 'standard' | 'splash';
  expiresAt: string | null;
  hasPassword: boolean;
  createdAt: string;
  /** null when the owning account no longer exists (an orphaned link). */
  owner: { id: string; email: string; username: string; fullName: string } | null;
}

const serializeAdminLink = (link: Omit<ILink, 'userId'> & { userId: IUser | null }): AdminLinkDTO => ({
  id: link._id.toString(),
  title: link.title ?? '',
  originalUrl: link.originalUrl,
  shortUrl: link.shortUrl,
  slug: link.slug,
  clicks: link.clicks,
  isActive: link.isActive,
  redirectMode: link.redirectMode,
  expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
  hasPassword: link.passwordHash != null,
  createdAt: link.createdAt.toISOString(),
  owner: link.userId
    ? {
        id: link.userId.id,
        email: link.userId.email,
        username: link.userId.username,
        fullName: link.userId.fullName,
      }
    : null,
});

const serializeUser = (user: IUser): AdminUserDTO => ({
  id: user.id,
  email: user.email,
  username: user.username,
  fullName: user.fullName,
  role: user.role,
  tier: user.tier,
  isVerified: user.isVerified,
  isBanned: user.isBanned,
  createdAt: user.createdAt.toISOString(),
});

const dayGroupPipeline = (since: Date): mongoose.PipelineStage[] => [
  { $match: { createdAt: { $gte: since } } },
  { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
];

/** Groups a model's documents by calendar day of `createdAt` over the trailing window. */
async function countByDay(
  model: { aggregate<T>(pipeline: mongoose.PipelineStage[]): mongoose.Aggregate<T[]> },
  since: Date,
): Promise<Map<string, number>> {
  const rows = await model.aggregate<{ _id: string; count: number }>(dayGroupPipeline(since));
  return new Map(rows.map((row) => [row._id, row.count]));
}

export class AdminService {
  async getGlobalStats(): Promise<GlobalStatsDTO> {
    const [totalUsers, totalLinks, clicksAgg, premiumUsers] = await Promise.all([
      User.countDocuments(),
      Link.countDocuments(),
      Link.aggregate<{ _id: null; total: number }>([
        { $group: { _id: null, total: { $sum: '$clicks' } } },
      ]),
      User.countDocuments({ tier: 'PREMIUM' }),
    ]);

    return {
      totalUsers,
      totalLinks,
      totalClicks: clicksAgg[0]?.total ?? 0,
      freeUsers: totalUsers - premiumUsers,
      premiumUsers,
    };
  }

  async getGrowthStats(): Promise<GrowthPointDTO[]> {
    const since = new Date();
    since.setDate(since.getDate() - (GROWTH_WINDOW_DAYS - 1));
    since.setHours(0, 0, 0, 0);

    const [usersByDay, linksByDay] = await Promise.all([
      countByDay(User, since),
      countByDay(Link, since),
    ]);

    const points: GrowthPointDTO[] = [];
    for (let i = 0; i < GROWTH_WINDOW_DAYS; i += 1) {
      const day = new Date(since);
      day.setDate(day.getDate() + i);
      const key = day.toISOString().slice(0, 10);
      points.push({
        date: key,
        newUsers: usersByDay.get(key) ?? 0,
        newLinks: linksByDay.get(key) ?? 0,
      });
    }
    return points;
  }

  async listUsers(
    query: ListUsersQuery,
  ): Promise<{ users: AdminUserDTO[]; total: number; page: number; limit: number }> {
    const { page, limit, search, status, sort } = query;

    // Admins manage other users here, not each other/themselves — that's
    // handled by their own account settings, not this moderation list.
    const filter: mongoose.FilterQuery<IUser> = { role: { $ne: 'admin' }, isDeleted: { $ne: true } };
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ email: rx }, { username: rx }, { fullName: rx }];
    }
    if (status === 'active') filter.isBanned = false;
    else if (status === 'banned') filter.isBanned = true;

    const sortSpec: Record<string, 1 | -1> = { createdAt: sort === 'oldest' ? 1 : -1 };

    const [docs, total] = await Promise.all([
      User.find(filter).sort(sortSpec).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);

    return { users: docs.map(serializeUser), total, page, limit };
  }

  async getUserById(id: string): Promise<AdminUserDTO & { linkCount: number }> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('User not found');
    }
    const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    const linkCount = await Link.countDocuments({ userId: user._id });
    return { ...serializeUser(user), linkCount };
  }

  /**
   * Loads the target of a moderation action, guarding against self-targeting
   * and against other admin accounts — admins aren't manageable from this
   * panel (matching listUsers' `role: { $ne: 'admin' }` filter), only by
   * their own account settings.
   */
  private async resolveModerationTarget(
    adminId: string,
    targetId: string,
    selfMessage: string,
    selfCode: string,
  ): Promise<IUser> {
    if (!mongoose.isValidObjectId(targetId)) {
      throw AppError.notFound('User not found');
    }
    if (targetId === adminId) {
      throw AppError.badRequest(selfMessage, selfCode);
    }
    const user = await User.findOne({ _id: targetId, isDeleted: { $ne: true } });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    if (user.role === 'admin') {
      throw AppError.badRequest('Không thể thao tác trên tài khoản quản trị viên khác', 'ADMIN_TARGET');
    }
    return user;
  }

  async updateUser(
    adminId: string,
    targetId: string,
    patch: UpdateUserInput,
  ): Promise<AdminUserDTO> {
    if (!mongoose.isValidObjectId(targetId)) {
      throw AppError.notFound('User not found');
    }

    const isSelf = targetId === adminId;
    if (patch.role !== undefined && isSelf) {
      throw AppError.badRequest('Không thể tự thay đổi vai trò của chính mình', 'SELF_ROLE_CHANGE');
    }

    const user = await User.findOne({ _id: targetId, isDeleted: { $ne: true } });
    if (!user) {
      throw AppError.notFound('User not found');
    }
    // Self is allowed through here only for a tier-only change (blocked
    // above for role changes); any other admin is never a valid target.
    if (!isSelf && user.role === 'admin') {
      throw AppError.badRequest('Không thể thao tác trên tài khoản quản trị viên khác', 'ADMIN_TARGET');
    }
    if (patch.role !== undefined) user.role = patch.role;
    if (patch.tier !== undefined) user.tier = patch.tier;
    await user.save();

    return serializeUser(user);
  }

  async banUser(adminId: string, targetId: string, isBanned: boolean): Promise<AdminUserDTO> {
    const user = await this.resolveModerationTarget(
      adminId,
      targetId,
      'Không thể tự khóa chính mình',
      'SELF_BAN',
    );
    user.isBanned = isBanned;
    await user.save();
    return serializeUser(user);
  }

  async deleteUser(adminId: string, targetId: string): Promise<void> {
    const user = await this.resolveModerationTarget(
      adminId,
      targetId,
      'Không thể tự xóa chính mình',
      'SELF_DELETE',
    );
    user.isDeleted = true;
    await user.save();
  }

  async listLinks(
    query: ListAdminLinksQuery,
  ): Promise<{ links: AdminLinkDTO[]; total: number; page: number; limit: number }> {
    const { page, limit, search, status, sort } = query;

    const and: mongoose.FilterQuery<ILink>[] = [{ isArchived: { $ne: true } }];
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i');
      // Search matches the link's own fields or its owner's email/username.
      const ownerIds = await User.find({ $or: [{ email: rx }, { username: rx }] }).distinct('_id');
      and.push({
        $or: [{ title: rx }, { originalUrl: rx }, { slug: rx }, { userId: { $in: ownerIds } }],
      });
    }
    if (status === 'active') and.push({ isActive: true });
    else if (status === 'inactive') and.push({ isActive: false });
    const filter: mongoose.FilterQuery<ILink> = and.length === 1 ? and[0] : { $and: and };

    const sortSpec: Record<string, 1 | -1> =
      sort === 'oldest' ? { createdAt: 1 } : sort === 'clicks' ? { clicks: -1 } : { createdAt: -1 };

    const [docs, total] = await Promise.all([
      Link.find(filter)
        .select('+passwordHash')
        .populate<{ userId: IUser | null }>('userId', 'email username fullName')
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit),
      Link.countDocuments(filter),
    ]);

    return { links: docs.map(serializeAdminLink), total, page, limit };
  }

  async getLinkById(id: string): Promise<AdminLinkDTO> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Link not found');
    }
    const link = await Link.findOne({ _id: id, isArchived: { $ne: true } })
      .select('+passwordHash')
      .populate<{ userId: IUser | null }>('userId', 'email username fullName');
    if (!link) {
      throw AppError.notFound('Link not found');
    }
    return serializeAdminLink(link);
  }

  async updateLink(id: string, patch: UpdateAdminLinkInput): Promise<AdminLinkDTO> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Link not found');
    }
    const link = await Link.findOne({ _id: id, isArchived: { $ne: true } }).select('+passwordHash');
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
    const populated = await link.populate<{ userId: IUser | null }>(
      'userId',
      'email username fullName',
    );
    return serializeAdminLink(populated);
  }

  async deleteLink(id: string): Promise<void> {
    if (!mongoose.isValidObjectId(id)) {
      throw AppError.notFound('Link not found');
    }
    const result = await Link.findOneAndUpdate(
      { _id: id, isArchived: { $ne: true } },
      { isArchived: true }
    );
    if (!result) {
      throw AppError.notFound('Link not found');
    }
  }
}

export const adminService = new AdminService();
