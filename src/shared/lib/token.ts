import { serverInstance } from '@/shared/api/instance';
import { type ApiResponse, type TokenPairResponse } from '@/shared/model/token';

const SERVER_LOGIN_SESSION_COOKIE = '__Host-cowork_oauth';

function getLoginSession(setCookies: string[] | undefined): string | null {
  const prefix = `${SERVER_LOGIN_SESSION_COOKIE}=`;
  const cookie = setCookies
    ?.map((value) => value.split(';')[0].trim())
    .find((value) => value.startsWith(prefix));

  return cookie?.slice(prefix.length) || null;
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
        headers: { Cookie: `${SERVER_LOGIN_SESSION_COOKIE}=${input.session}` },
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
