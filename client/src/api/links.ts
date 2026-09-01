import axios from 'axios';
import { api } from '../lib/axios';

const SERVER_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
);

export interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  clicks: number;
  title?: string;
  isActive?: boolean;
  redirectMode?: 'standard' | 'splash';
  expiresAt?: string | null;
  hasPassword?: boolean;
  createdAt?: string;
}

export interface CreateLinkInput {
  originalUrl: string;
  title?: string;
  slug?: string;
  expiresAt?: string;
  redirectMode?: 'standard' | 'splash';
  password?: string;
}

export interface UpdateLinkInput {
  title?: string;
  originalUrl?: string;
  status?: 'active' | 'inactive';
  redirectMode?: 'standard' | 'splash';
  expiresAt?: string | null;
  password?: string;
}

export interface ListLinksResult {
  links: ShortenedLink[];
  total: number;
  page: number;
  limit: number;
}

export const createLink = async (input: CreateLinkInput | string): Promise<ShortenedLink> => {
  const body = typeof input === 'string' ? { originalUrl: input } : input;
  const res = await api.post('/links', body);
  return res.data.data.link;
};

export const listLinks = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  sort?: 'newest' | 'oldest' | 'clicks';
}): Promise<ListLinksResult> => {
  const res = await api.get('/links', { params });
  return res.data.data;
};

export const getLink = async (id: string): Promise<ShortenedLink> => {
  const res = await api.get(`/links/${id}`);
  return res.data.data.link;
};

export const updateLink = async (
  id: string,
  input: UpdateLinkInput,
): Promise<ShortenedLink> => {
  const res = await api.put(`/links/${id}`, input);
  return res.data.data.link;
};

export const deleteLink = async (id: string): Promise<void> => {
  await api.delete(`/links/${id}`);
};

// The verify route is public and lives at the server root (not under /api).
export const verifyLinkPassword = async (
  slug: string,
  password: string,
): Promise<string> => {
  const res = await axios.post(`${SERVER_ORIGIN}/${slug}/verify`, { password });
  return res.data.data.originalUrl;
};
