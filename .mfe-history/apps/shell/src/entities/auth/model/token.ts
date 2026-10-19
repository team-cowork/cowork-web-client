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

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function storeTokens(response: TokenPairResponse) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${response.refresh_token}; path=/; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  const match = document.cookie.match(/(?:^|; )refresh_token=([^;]*)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
}
