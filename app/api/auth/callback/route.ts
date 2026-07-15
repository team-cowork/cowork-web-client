import { type NextRequest, NextResponse } from 'next/server';

import { CODE_VERIFIER_COOKIE, OAUTH_STATE_COOKIE } from '@/entities/auth/model/token';
import { exchangeCodeForTokens } from '@/features/auth/api/token';
import { clearPkceCookies, setTokenCookies } from '@/features/auth/lib/cookies';

/**
 * DataGSM authorize 리다이렉트 복귀 지점. httpOnly 쿠키의 code_verifier·state로 CSRF를 검증한 뒤
 * Cowork Authorization API로 code↔verifier를 교환해 토큰을 httpOnly 쿠키로 저장한다.
 * 클라이언트는 code_verifier·토큰 어느 것도 읽지 못한다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const verifier = request.cookies.get(CODE_VERIFIER_COOKIE)?.value;
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  const failure = () => {
    const response = NextResponse.redirect(new URL('/auth/error', request.url));
    clearPkceCookies(response);
    return response;
  };

  if (error || !code || !state || !verifier || !savedState || state !== savedState) {
    return failure();
  }

  const redirectUri = new URL('/api/auth/callback', request.url).toString();
  const tokens = await exchangeCodeForTokens({ code, verifier, redirectUri });
  if (!tokens) return failure();

  const response = NextResponse.redirect(new URL('/', request.url));
  setTokenCookies(response, tokens);
  clearPkceCookies(response);
  return response;
}
