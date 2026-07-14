/**
 * DataGSM 인증 토큰 저장소.
 *
 * access_token은 sessionStorage(탭 닫으면 소멸)에, refresh_token은 쿠키에 저장한다.
 * API 응답 필드명(snake_case)을 변환 없이 그대로 쓴다.
 */
export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

/** Cowork Authorization API가 모든 응답을 감싸는 공통 봉투. 실제 값은 `data`에 있다. */
export interface ApiEnvelope<T> {
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
