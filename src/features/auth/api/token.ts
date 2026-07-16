import { type ApiResponse, type TokenPairResponse } from '@/shared/model/token';
import { instance } from '@/features/auth/api/instance';

async function postForTokens(
  path: string,
  body: Record<string, string>,
): Promise<TokenPairResponse | null> {
  try {
    const response = await instance.post<ApiResponse<TokenPairResponse>>(path, body);
    const data = response.data.data;
    if (!data?.access_token || !data.refresh_token) return null;

    return data;
  } catch {
    return null;
  }
}

export function exchangeCodeForTokens(input: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<TokenPairResponse | null> {
  return postForTokens('/auth/token', {
    code: input.code,
    code_verifier: input.verifier,
    redirect_uri: input.redirectUri,
  });
}

export function refreshTokens(refreshToken: string): Promise<TokenPairResponse | null> {
  return postForTokens('/auth/refresh', { refresh_token: refreshToken });
}

export async function revokeTokens(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  try {
    await instance.post(
      '/auth/signout',
      { refresh_token: input.refreshToken },
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
    );
  } catch {
    return;
  }
}
