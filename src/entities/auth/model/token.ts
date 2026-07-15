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

/** 발급된 JWT 액세스/리프레시 토큰 쿠키. 모두 httpOnly라 JS에서 접근 불가. */
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/** authorize → callback 왕복 동안만 유지되는 PKCE 임시 쿠키. 콜백에서 소비 후 삭제. */
export const CODE_VERIFIER_COOKIE = 'oauth_code_verifier';
export const OAUTH_STATE_COOKIE = 'oauth_state';
