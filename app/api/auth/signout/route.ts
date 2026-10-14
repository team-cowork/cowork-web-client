import { type NextRequest, NextResponse } from 'next/server';

import { REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { appUrl } from '@/shared/lib/app-url';
import { refreshTokens, revokeTokens } from '@/shared/lib/token';
import { clearTokenCookies } from '@/shared/lib/cookies';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (tokens) {
      await revokeTokens({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      });
    }
  }

  const response = NextResponse.redirect(appUrl('/signin', request));
  clearTokenCookies(response);
  return response;
}
