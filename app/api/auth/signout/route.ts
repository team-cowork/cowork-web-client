import { type NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/entities/auth/model/token';
import { revokeTokens } from '@/features/auth/api/token';
import { clearTokenCookies } from '@/features/auth/lib/cookies';

/** 서버 쪽 refresh_token을 무효화하고 토큰 쿠키를 정리한 뒤 로그인 페이지로 보낸다. */
export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && refreshToken) {
    await revokeTokens({ accessToken, refreshToken });
  }

  const response = NextResponse.redirect(new URL('/signin', request.url));
  clearTokenCookies(response);
  return response;
}
