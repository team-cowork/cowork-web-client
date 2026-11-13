import { serverInstance } from '@/shared/api/instance';
import { type ApiResponse } from '@/shared/model/api-response';
import { type TokenPairResponse } from '@/shared/model/token';

// 서버는 로그인 시도마다 state로 이름을 정한 쿠키(`__Host-cowork_oauth_{state 해시}`)를 내려 준다.
// 콜백 때 같은 이름으로 돌려보내야 하므로 이름과 값을 `name=value` 그대로 보관한다.
const SERVER_LOGIN_SESSION_COOKIE_PREFIX = '__Host-cowork_oauth_';

function getLoginSession(setCookies: string[] | undefined): string | null {
  const cookie = setCookies
    ?.map((value) => value.split(';')[0].trim())
    .find((value) => value.startsWith(SERVER_LOGIN_SESSION_COOKIE_PREFIX));
  if (!cookie) return null;

  const separator = cookie.indexOf('=');
  if (separator <= SERVER_LOGIN_SESSION_COOKIE_PREFIX.length) return null;
  if (separator === cookie.length - 1) return null;

  return cookie;
}

export async function startLogin(
  redirectUri: string,
): Promise<{ authorizationUrl: string; session: string } | null> {
  try {
    const response = await serverInstance.post<
      ApiResponse<{ authorization_url: string }>
    >('/authorization/auth/authorize', { redirect_uri: redirectUri });
    const authorizationUrl = response.data.data?.authorization_url;
    const session = getLoginSession(response.headers['set-cookie']);
    if (!authorizationUrl || !session) return null;

    return { authorizationUrl, session };
  } catch {
    return null;
  }
}

export async function completeLogin(input: {
  state: string;
  code?: string;
  error?: string;
  session: string;
}): Promise<TokenPairResponse | null> {
  try {
    const response = await serverInstance.post<ApiResponse<TokenPairResponse>>(
      '/authorization/auth/callback',
      {
        state: input.state,
        ...(input.error !== undefined
          ? { error: input.error }
          : { code: input.code }),
      },
      {
        headers: { Cookie: input.session },
      },
    );
    const data = response.data.data;
    if (!data?.access_token || !data.refresh_token) return null;

    return data;
  } catch {
    return null;
  }
}

export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPairResponse | null> {
  try {
    const response = await serverInstance.post<ApiResponse<TokenPairResponse>>(
      '/authorization/auth/refresh',
      {
        refresh_token: refreshToken,
      },
    );
    const data = response.data.data;
    if (!data?.access_token || !data.refresh_token) return null;

    return data;
  } catch {
    return null;
  }
}

export async function revokeTokens(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  try {
    await serverInstance.post(
      '/authorization/auth/signout',
      { refresh_token: input.refreshToken },
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
    );
  } catch {
    return;
  }
}
