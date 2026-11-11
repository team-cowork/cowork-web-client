import { type NextResponse } from 'next/server';

import {
  LOGIN_SESSION_COOKIE,
  REFRESH_TOKEN_COOKIE,
  type TokenPairResponse,
} from '@/shared/model/token';

const LOGIN_SESSION_MAX_AGE = 600;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function setLoginSessionCookie(response: NextResponse, session: string) {
  // HTTP 로컬 환경에서도 중계할 수 있도록 __Host- 접두사 없는 자체 쿠키를 사용한다.
  response.cookies.set(LOGIN_SESSION_COOKIE, session, {
    ...baseCookieOptions(),
    maxAge: LOGIN_SESSION_MAX_AGE,
  });
}

export function clearLoginSessionCookie(response: NextResponse) {
  response.cookies.delete(LOGIN_SESSION_COOKIE);
}

export function setRefreshTokenCookie(
  response: NextResponse,
  tokens: TokenPairResponse,
) {
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...baseCookieOptions(),
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}
