import { type NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { refreshTokens } from '@/shared/auth/api/token';
import { clearTokenCookies, setTokenCookies } from '@/shared/auth/lib/cookies';

const PUBLIC_PATHS = ['/signin', '/auth/error'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  if (request.cookies.get(ACCESS_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (tokens) {
      request.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access_token);
      request.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh_token);
      const response = NextResponse.next({
        request: { headers: new Headers(request.headers) },
      });
      setTokenCookies(response, tokens);
      return response;
    }
  }

  const response = NextResponse.redirect(new URL('/signin', request.url));
  clearTokenCookies(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|woff2?)).*)',
  ],
};
