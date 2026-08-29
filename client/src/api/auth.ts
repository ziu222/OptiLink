import { api } from '../lib/axios';
import type { LoginPayload, RegisterPayload, UpdateProfilePayload, User } from '../types/auth';

interface AuthResult {
  accessToken: string;
  user: User;
}

export const register = async (payload: RegisterPayload): Promise<AuthResult> => {
  const res = await api.post('/auth/register', payload);
  return res.data.data;
};

export const login = async (payload: LoginPayload): Promise<AuthResult> => {
  const res = await api.post('/auth/login', payload);
  return res.data.data;
};

export const refresh = async (): Promise<{ accessToken: string }> => {
  const res = await api.post('/auth/refresh');
  return res.data.data;
};

export const me = async (): Promise<{ user: User }> => {
  const res = await api.get('/auth/me');
  return res.data.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/auth/logout');
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<{ user: User }> => {
  const res = await api.put('/auth/profile', payload);
  return res.data.data;
};
