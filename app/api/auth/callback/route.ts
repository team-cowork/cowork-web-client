import { type NextRequest, NextResponse } from 'next/server';

import { CODE_VERIFIER_COOKIE, OAUTH_STATE_COOKIE } from '@/shared/model/token';
import { appUrl } from '@/shared/lib/app-url';
import { exchangeCodeForTokens } from '@/shared/lib/token';
import { clearPkceCookies, setRefreshTokenCookie } from '@/shared/lib/cookies';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const verifier = request.cookies.get(CODE_VERIFIER_COOKIE)?.value;
  const savedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  const failure = () => {
    const response = NextResponse.redirect(appUrl('/auth/error', request));
    clearPkceCookies(response);
    return response;
  };

  if (
    error ||
    !code ||
    !state ||
    !verifier ||
    !savedState ||
    state !== savedState
  ) {
    return failure();
  }

  const redirectUri = appUrl('/api/auth/callback', request).toString();
  const tokens = await exchangeCodeForTokens({ code, verifier, redirectUri });
  if (!tokens) return failure();

  const response = NextResponse.redirect(appUrl('/', request));
  setRefreshTokenCookie(response, tokens);
  clearPkceCookies(response);
  return response;
}
