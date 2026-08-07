import { type NextRequest, NextResponse } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/shared/model/token";
import { refreshTokens, revokeTokens } from "@/shared/auth/api/token";
import { clearTokenCookies } from "@/shared/auth/lib/cookies";

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

  const response = NextResponse.redirect(new URL("/signin", request.url));
  clearTokenCookies(response);
  return response;
}
