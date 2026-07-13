import { getTokens, isTokenExpired } from '../../entities/auth/model';
import { refreshAccessToken } from './refresh';

/** 라우트 진입 가드용: 유효 토큰이 있으면 true, 만료면 조용히 갱신 시도 후 결과를 반환한다. */
export async function ensureAuthenticated(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return false;
  if (!isTokenExpired(tokens)) return true;

  return refreshAccessToken();
}
