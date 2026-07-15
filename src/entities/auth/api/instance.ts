import axios from 'axios';

import { AUTH_CONFIG } from '@/entities/auth/config/config';

/** Cowork Authorization API(code↔verifier 교환·토큰 갱신·로그아웃) 전용 axios 인스턴스. */
export const instance = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((requestConfig) => {
  requestConfig.baseURL = AUTH_CONFIG.authApiBaseUrl;
  return requestConfig;
});
