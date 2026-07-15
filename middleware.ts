import { type NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { refreshTokens } from '@/features/auth/api/token';
import { clearTokenCookies, setTokenCookies } from '@/features/auth/lib/cookies';

const PUBLIC_PATHS = ['/signin', '/auth/error'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  if (request.cookies.get(ACCESS_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (refreshToken) {
    const tokens = await refreshTokens(refreshToken);
    if (tokens) {
      const response = NextResponse.next();
      setTokenCookies(response, tokens);
      return response;
    }
  }

  const response = NextResponse.redirect(new URL('/signin', request.url));
  clearTokenCookies(response);
  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
