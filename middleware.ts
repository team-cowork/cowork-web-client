import { type NextRequest, NextResponse } from 'next/server';

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { refreshTokens } from '@/features/auth/api/token';
import { clearTokenCookies, setTokenCookies } from '@/features/auth/lib/cookies';

/** 가드를 받지 않는 공개 페이지. /api/auth/* 와 정적 자원은 아래 matcher에서 제외된다. */
const PUBLIC_PATHS = ['/signin', '/auth/error'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * 라우트 진입 가드. access_token 쿠키가 있으면 통과, 없으면 refresh_token으로 조용히 갱신을
 * 시도하고, 그마저 없거나 실패하면 /signin으로 리다이렉트한다. 토큰은 httpOnly라 서버(미들웨어)
 * 에서만 판정할 수 있다.
 */
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
