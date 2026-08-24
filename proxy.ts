import { type NextRequest, NextResponse } from 'next/server';

import { isPublicPath } from '@/shared/model/routes';
import { REFRESH_TOKEN_COOKIE } from '@/shared/model/token';
import { clearTokenCookies } from '@/shared/lib/cookies';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isPublicPath(pathname)) return NextResponse.next();

  if (request.cookies.get(REFRESH_TOKEN_COOKIE)?.value) {
    return NextResponse.next();
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
