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

export const REFRESH_TOKEN_COOKIE = 'refresh_token';
export const ACCESS_TOKEN_STORAGE_KEY = 'access_token';

export const LOGIN_SESSION_COOKIE = 'oauth_login_session';
