import { AUTH_CONFIG } from '../../entities/auth/config';
import {
  clearTokens,
  getTokens,
  storeTokens,
  type TokenPairResponse,
} from '../../entities/auth/model';

/** refresh_token으로 access/refresh 토큰을 새로 발급받는다. 실패하면 저장된 토큰을 비운다. */
export async function refreshAccessToken(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return false;

  const response = await fetch(`${AUTH_CONFIG.authApiBaseUrl}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: tokens.refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return false;
  }

  const data = (await response.json()) as TokenPairResponse;
  if (!data.access_token || !data.refresh_token) {
    clearTokens();
    return false;
  }
  storeTokens(data);
  return true;
}
