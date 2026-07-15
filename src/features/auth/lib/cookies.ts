import { type NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_COOKIE,
  CODE_VERIFIER_COOKIE,
  OAUTH_STATE_COOKIE,
  REFRESH_TOKEN_COOKIE,
  type TokenPairResponse,
} from '@/entities/auth/model/token';

/** PKCE 임시 쿠키 수명(초). authorize → callback 왕복에만 필요해 짧게 둔다. */
const PKCE_MAX_AGE = 600;
/** refresh_token 쿠키 수명(초). 서버가 실제 만료를 관리하므로 넉넉히 잡는다. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * httpOnly 쿠키는 JS에서 접근 불가라 XSS로 탈취되지 않는다. 로컬(http)에서는 secure 쿠키가
 * 저장되지 않으므로 production에서만 secure를 켠다. sameSite=lax는 DataGSM에서 우리 콜백으로
 * 돌아오는 top-level GET 리다이렉트에 쿠키가 실려 오도록 허용한다.
 */
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

export function setTokenCookies(response: NextResponse, tokens: TokenPairResponse) {
  const base = baseCookieOptions();
  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token, {
    ...base,
    maxAge: tokens.expires_in,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token, {
    ...base,
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearTokenCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
}
