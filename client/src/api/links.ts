import { api } from '../lib/axios';

export interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  slug: string;
  clicks: number;
}

export const createLink = async (originalUrl: string): Promise<ShortenedLink> => {
  const res = await api.post('/links', { originalUrl });
  return res.data.data.link;
};
