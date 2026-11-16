import { type NextRequest, NextResponse } from 'next/server';

import { HOME_PATH, PROMOTION_PATH, SIGNIN_PATH } from '@/shared/model/paths';
import { isPublicPath } from '@/shared/model/routes';
import { REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { clearTokenCookies } from '@/shared/lib/cookies';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 프로모션 페이지는 홈(/)으로만 보여 주고, 내부 경로로 직접 들어오면 홈으로 보낸다.
  if (
    pathname === PROMOTION_PATH ||
    pathname.startsWith(`${PROMOTION_PATH}/`)
  ) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  if (isPublicPath(pathname)) return NextResponse.next();

  if (request.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
  }

  // 처음 들어온 사람은 주소를 그대로 둔 채 소개 화면을 보고, 특정 화면을 열려던 사람은 바로 로그인한다.
  const response =
    pathname === HOME_PATH
      ? NextResponse.rewrite(new URL(PROMOTION_PATH, request.url))
      : NextResponse.redirect(new URL(SIGNIN_PATH, request.url));
  clearTokenCookies(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|woff2?)).*)',
  ],
};
