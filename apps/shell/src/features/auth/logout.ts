import { AUTH_CONFIG } from '../../entities/auth/config';
import { clearTokens, getTokens } from '../../entities/auth/model';

/** 서버 쪽 refresh_token을 무효화하고 로컬 토큰을 정리한다. */
export async function logout() {
  const tokens = getTokens();

  if (tokens) {
    try {
      await fetch(`${AUTH_CONFIG.authApiBaseUrl}/auth/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({ refresh_token: tokens.refreshToken }),
      });
    } catch {
      // 네트워크 실패해도 로컬 세션은 반드시 정리한다.
    }
  }

  clearTokens();
}
