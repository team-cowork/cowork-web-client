import axios from 'axios';

import { AUTH_CONFIG } from '../config/config';

export const instance = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((requestConfig) => {
  requestConfig.baseURL = AUTH_CONFIG.authApiBaseUrl;
  return requestConfig;
});
