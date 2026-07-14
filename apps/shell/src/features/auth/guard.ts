import { getAccessToken, getRefreshToken } from '../../entities/auth/model';
import { refreshAccessToken } from './refresh';

/** 라우트 진입 가드용: access_token이 있으면 true, 없으면 refresh_token으로 갱신을 시도한다. */
export async function ensureAuthenticated(): Promise<boolean> {
  if (getAccessToken()) return true;
  if (!getRefreshToken()) return false;

  return refreshAccessToken();
}
