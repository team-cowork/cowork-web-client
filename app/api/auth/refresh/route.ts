import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/shared/model/token";
import { refreshTokens } from "@/shared/auth/api/token";
import { clearTokenCookies, setRefreshTokenCookie } from "@/shared/auth/lib/cookies";

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "로그인이 필요합니다" }, { status: 401 });
  }

  const tokens = await refreshTokens(refreshToken);

  if (!tokens) {
    const response = NextResponse.json({ message: "세션이 만료되었습니다" }, { status: 401 });
    clearTokenCookies(response);
    return response;
  }

  const response = NextResponse.json({ access_token: tokens.access_token });
  setRefreshTokenCookie(response, tokens);
  return response;
}
