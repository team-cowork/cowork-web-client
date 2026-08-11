import { type NextResponse } from 'next/server';

import {
  CODE_VERIFIER_COOKIE,
  OAUTH_STATE_COOKIE,
  REFRESH_TOKEN_COOKIE,
  type TokenPairResponse,
} from '@/shared/model/token';

const PKCE_MAX_AGE = 600;
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

function baseCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function setPkceCookies(response: NextResponse, verifier: string, state: string) {
  const options = { ...baseCookieOptions(), maxAge: PKCE_MAX_AGE };
  response.cookies.set(CODE_VERIFIER_COOKIE, verifier, options);
  response.cookies.set(OAUTH_STATE_COOKIE, state, options);
}

export function clearPkceCookies(response: NextResponse) {
  response.cookies.delete(CODE_VERIFIER_COOKIE);
  response.cookies.delete(OAUTH_STATE_COOKIE);
}

export function setRefreshTokenCookie(response: NextResponse, tokens: TokenPairResponse) {
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...baseCookieOptions(),
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}
