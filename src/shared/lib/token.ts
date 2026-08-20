import { Agent } from "https";

import axios from "axios";

import { type ApiResponse, type TokenPairResponse } from "@/shared/model/token";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: { "Content-Type": "application/json" },
  // TLS 우회: auth 서버(Spring)가 self-signed 인증서를 써서 개발 환경에서만 인증서 검증을 끈다.
  // production은 정상 검증. 백엔드에 정상 CA 인증서가 적용되면 제거할 임시 코드.
  ...(process.env.NODE_ENV !== "production"
    ? { httpsAgent: new Agent({ rejectUnauthorized: false }) }
    : {}),
});

export async function exchangeCodeForTokens(input: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<TokenPairResponse | null> {
  try {
    const response = await instance.post<ApiResponse<TokenPairResponse>>(
      "/auth/token",
      {
        code: input.code,
        code_verifier: input.verifier,
        redirect_uri: input.redirectUri,
      },
    );
    const data = response.data.data;
    if (!data?.access_token || !data.refresh_token) return null;

    return data;
  } catch {
    return null;
  }
}

export async function refreshTokens(
  refreshToken: string,
): Promise<TokenPairResponse | null> {
  try {
    const response = await instance.post<ApiResponse<TokenPairResponse>>(
      "/auth/refresh",
      {
        refresh_token: refreshToken,
      },
    );
    const data = response.data.data;
    if (!data?.access_token || !data.refresh_token) return null;

    return data;
  } catch {
    return null;
  }
}

export async function revokeTokens(input: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  try {
    await instance.post(
      "/auth/signout",
      { refresh_token: input.refreshToken },
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
    );
  } catch {
    return;
  }
}
