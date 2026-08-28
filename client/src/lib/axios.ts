import axios, { AxiosError, AxiosHeaders } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

/** A bare client for the refresh call so it never re-enters the response interceptor. */
const refreshClient = axios.create({ baseURL, withCredentials: true });

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const AUTH_PATHS_NO_RETRY = ['/auth/refresh', '/auth/login', '/auth/register'];

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// De-dupe concurrent refreshes into a single in-flight request.
let refreshPromise: Promise<string> | null = null;

const runRefresh = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((res) => {
        const token: string = res.data.data.accessToken;
        setAccessToken(token);
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? '';

    const shouldTryRefresh =
      status === 401 &&
      original != null &&
      !original._retry &&
      !AUTH_PATHS_NO_RETRY.some((p) => url.includes(p));

    if (!shouldTryRefresh) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await runRefresh();
      return api(original);
    } catch (refreshError) {
      setAccessToken(null);
      return Promise.reject(refreshError);
    }
  }
);
