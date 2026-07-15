import { instance } from '@/entities/auth/api/instance';
import { clearTokens, getAccessToken, getRefreshToken } from '@/entities/auth/model/token';

/** 서버 쪽 refresh_token을 무효화하고 로컬 토큰을 정리한다. */
export async function signout() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();

  if (accessToken && refreshToken) {
    try {
      await instance.post(
        '/auth/signout',
        { refresh_token: refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
    } catch {
      // 네트워크 실패해도 로컬 세션은 반드시 정리한다.
    }
  }

  clearTokens();
}
