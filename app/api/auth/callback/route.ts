import { type NextRequest, NextResponse } from 'next/server';

import { LOGIN_SESSION_COOKIE } from '@/shared/model/token';
import { appUrl } from '@/shared/lib/app-url';
import { completeLogin } from '@/shared/lib/token';
import {
  clearLoginSessionCookie,
  setRefreshTokenCookie,
} from '@/shared/lib/cookies';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const session = request.cookies.get(LOGIN_SESSION_COOKIE)?.value;

  const failure = () => {
    const response = NextResponse.redirect(appUrl('/auth/error', request));
    clearLoginSessionCookie(response);
    return response;
  };

  if (!state || !session) return failure();

  if (error !== null) {
    await completeLogin({ state, error, session });
    return failure();
  }

  if (!code) return failure();

  const tokens = await completeLogin({ state, code, session });
  if (!tokens) return failure();

  const response = NextResponse.redirect(appUrl('/', request));
  setRefreshTokenCookie(response, tokens);
  clearLoginSessionCookie(response);
  return response;
}
