import { type NextRequest, NextResponse } from 'next/server';

import { HOME_PATH, SIGNIN_PATH, WELCOME_PATH } from '@/shared/model/paths';
import { isPublicPath } from '@/shared/model/routes';
import { REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { clearTokenCookies } from '@/shared/lib/cookies';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  if (request.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  // 처음 들어온 사람은 소개 화면부터 보고, 특정 화면을 열려던 사람은 바로 로그인한다.
  const target = pathname === HOME_PATH ? WELCOME_PATH : SIGNIN_PATH;
  const response = NextResponse.redirect(new URL(target, request.url));
  clearTokenCookies(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|woff2?)).*)',
  ],
};
