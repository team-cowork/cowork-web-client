import { type NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/shared/model/token";
import { revokeTokens } from "@/shared/auth/api/token";
import { clearTokenCookies } from "@/shared/auth/lib/cookies";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && refreshToken) {
    await revokeTokens({ accessToken, refreshToken });
  }

  const response = NextResponse.redirect(new URL("/signin", request.url));
  clearTokenCookies(response);
  return response;
}
