import { type ApiResponse, type TokenPairResponse } from '@/shared/model/token';

/**
 * Cowork Authorization API 베이스 URL(서버 전용). DataGSM 토큰 엔드포인트는 client_secret이
 * 필요해 프론트가 직접 호출하지 않고, 이 API가 code↔verifier 교환·갱신·로그아웃을 대행한다.
 */
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

/** authorize에서 받은 code와 httpOnly 쿠키의 code_verifier를 교환해 토큰을 발급받는다. */
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

/** refresh_token으로 access/refresh 토큰을 새로 발급받는다. */
export function refreshTokens(refreshToken: string): Promise<TokenPairResponse | null> {
  return postForTokens('/auth/refresh', { refresh_token: refreshToken });
}

/** 서버 쪽 refresh_token을 무효화한다. 네트워크 실패는 무시하고 로컬 쿠키 정리를 우선한다. */
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
    // 무효화 실패해도 쿠키는 반드시 정리한다.
  }
}
