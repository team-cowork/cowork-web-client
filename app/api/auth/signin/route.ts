import { type NextRequest, NextResponse } from 'next/server';

import { appUrl } from '@/shared/lib/app-url';
import { setLoginSessionCookie } from '@/shared/lib/cookies';
import { startLogin } from '@/shared/lib/token';

export async function GET(request: NextRequest) {
  const redirectUri = appUrl('/api/auth/callback', request).toString();
  const login = await startLogin(redirectUri);
  if (!login) {
    return NextResponse.redirect(appUrl('/auth/error', request));
  }

  const response = NextResponse.redirect(login.authorizationUrl);
  setLoginSessionCookie(response, login.session);
  return response;
}
