import { type ApiResponse, type TokenPairResponse } from '@/shared/model/token';

const AUTH_API_BASE_URL = process.env.AUTH_API_BASE_URL ?? '';

async function postForTokens(
  path: string,
  body: Record<string, string>,
): Promise<TokenPairResponse | null> {
  try {
    const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!response.ok) return null;

    const json = (await response.json()) as ApiResponse<TokenPairResponse>;
    const data = json.data;
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
    await fetch(`${AUTH_API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${input.accessToken}`,
      },
      body: JSON.stringify({ refresh_token: input.refreshToken }),
      cache: 'no-store',
    });
  } catch {
    return;
  }
}
