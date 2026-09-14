import { api } from '../lib/axios';

export interface GlobalStats {
  totalUsers: number;
  totalLinks: number;
  totalClicks: number;
  freeUsers: number;
  premiumUsers: number;
}

export interface GrowthPoint {
  date: string;
  newUsers: number;
  newLinks: number;
}

export interface AdminUser {
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

export interface AdminUserDetail extends AdminUser {
  linkCount: number;
}

export interface ListUsersResult {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export const getGlobalStats = async (): Promise<GlobalStats> => {
  const res = await api.get('/admin/stats');
  return res.data.data;
};

export const getGrowthStats = async (): Promise<GrowthPoint[]> => {
  const res = await api.get('/admin/stats/growth');
  return res.data.data.growth;
};

export const listUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'banned';
  sort?: 'newest' | 'oldest';
}): Promise<ListUsersResult> => {
  const res = await api.get('/admin/users', { params });
  return res.data.data;
};

export const getUser = async (id: string): Promise<AdminUserDetail> => {
  const res = await api.get(`/admin/users/${id}`);
  return res.data.data.user;
};

export const updateUser = async (
  id: string,
  input: { role?: 'user' | 'admin'; tier?: 'FREE' | 'PREMIUM' },
): Promise<AdminUser> => {
  const res = await api.put(`/admin/users/${id}`, input);
  return res.data.data.user;
};

export const banUser = async (id: string, isBanned: boolean): Promise<AdminUser> => {
  const res = await api.put(`/admin/users/${id}/ban`, { isBanned });
  return res.data.data.user;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/admin/users/${id}`);
};

export interface AdminLinkOwner {
  id: string;
  email: string;
  username: string;
  fullName: string;
}

export interface AdminLink {
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
  owner: AdminLinkOwner | null;
}

export interface UpdateAdminLinkInput {
  title?: string;
  originalUrl?: string;
  status?: 'active' | 'inactive';
  redirectMode?: 'standard' | 'splash';
  expiresAt?: string | null;
  password?: string;
}

export interface ListAdminLinksResult {
  links: AdminLink[];
  total: number;
  page: number;
  limit: number;
}

export const listLinks = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  sort?: 'newest' | 'oldest' | 'clicks';
}): Promise<ListAdminLinksResult> => {
  const res = await api.get('/admin/links', { params });
  return res.data.data;
};

export const getLink = async (id: string): Promise<AdminLink> => {
  const res = await api.get(`/admin/links/${id}`);
  return res.data.data.link;
};

export const updateLink = async (
  id: string,
  input: UpdateAdminLinkInput,
): Promise<AdminLink> => {
  const res = await api.put(`/admin/links/${id}`, input);
  return res.data.data.link;
};

export const deleteLink = async (id: string): Promise<void> => {
  await api.delete(`/admin/links/${id}`);
};
