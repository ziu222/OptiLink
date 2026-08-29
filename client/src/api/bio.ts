import { api } from '../lib/axios';
import type { IBioPage } from '../types/bio';

export const uploadBioMedia = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/bio/upload-media', formData);
  return res.data.data.url;
};

export const getMyBio = async (): Promise<IBioPage | null> => {
  try {
    const res = await api.get('/bio/user');
    return res.data.data.bio;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
};

export const saveBio = async (bioData: Partial<IBioPage>): Promise<IBioPage> => {
  const res = await api.post('/bio', bioData);
  return res.data.data.bio;
};
