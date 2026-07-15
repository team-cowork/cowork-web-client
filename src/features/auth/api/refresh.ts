import { instance } from '@/entities/auth/api/instance';
import {
  type ApiResponse,
  clearTokens,
  getRefreshToken,
  storeTokens,
  type TokenPairResponse,
} from '@/entities/auth/model/token';

/** refresh_token으로 access/refresh 토큰을 새로 발급받는다. 실패하면 저장된 토큰을 비운다. */
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await instance.post<ApiResponse<TokenPairResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    });

    const data = response.data.data;
    if (!data?.access_token || !data.refresh_token) {
      clearTokens();
      return false;
    }
    storeTokens(data);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}
