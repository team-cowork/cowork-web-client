export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}

export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_TOKEN_STORAGE_KEY = "access_token";

export const CODE_VERIFIER_COOKIE = "oauth_code_verifier";
export const OAUTH_STATE_COOKIE = "oauth_state";
