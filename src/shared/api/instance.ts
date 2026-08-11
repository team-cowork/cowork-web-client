import axios, { HttpStatusCode } from 'axios';

import { isPublicPath } from '@/shared/model/routes';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/shared/model/token';

const REFRESH_ROUTE = '/api/auth/refresh';

export const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string> | null = null;

export function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access_token: string }>(REFRESH_ROUTE)
      .then(({ data }) => {
        const accessToken = data.access_token;
        if (!accessToken) throw new Error('액세스 토큰을 발급받지 못했습니다');

        sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

instance.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;

  const accessToken =
    sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ??
    (await refreshAccessToken().catch(() => null));

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window === 'undefined') return Promise.reject(error);

    const config = error.config;
    const isRetriable =
      error.response?.status === HttpStatusCode.Unauthorized &&
      config &&
      !config.headers['x-retried'];
    if (!isRetriable) return Promise.reject(error);

    config.headers['x-retried'] = 'true';

    try {
      const accessToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
      return await instance(config);
    } catch (refreshError) {
      sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      if (!isPublicPath(window.location.pathname)) {
        window.location.replace('/signin');
      }

      return Promise.reject(refreshError);
    }
  },
);
