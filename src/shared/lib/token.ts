import { serverInstance } from "@/shared/api/instance";
import { type ApiResponse, type TokenPairResponse } from "@/shared/model/token";

export async function exchangeCodeForTokens(input: {
  code: string;
  verifier: string;
  redirectUri: string;
}): Promise<TokenPairResponse | null> {
  try {
    const response = await serverInstance.post<ApiResponse<TokenPairResponse>>(
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
    const response = await serverInstance.post<ApiResponse<TokenPairResponse>>(
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
    await serverInstance.post(
      "/auth/signout",
      { refresh_token: input.refreshToken },
      { headers: { Authorization: `Bearer ${input.accessToken}` } },
    );
  } catch {
    return;
  }
}
