/**
 * DataGSM 인증 토큰 저장소.
 *
 * BFF 없이 순수 SPA로 배포되는 shell 특성상 refresh_token을 httpOnly 쿠키에
 * 둘 수 없어 부득이 localStorage에 저장한다(XSS 노출 트레이드오프 인지).
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** epoch ms */
  expiresAt: number;
}

export interface TokenPairResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const STORAGE_KEY = 'datagsm_auth_tokens';

export function storeTokens(response: TokenPairResponse): TokenPair {
  const tokens: TokenPair = {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    expiresAt: Date.now() + response.expires_in * 1000,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  return tokens;
}

export function getTokens(): TokenPair | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<TokenPair>;
    // accessToken/refreshToken이 빈 경우(백엔드 응답 누락 등) 그대로 반환하면
    // 이후 refresh 요청 body가 {}로 나가 400을 유발한다 — 애초에 유효하지 않은 세션으로 취급한다.
    if (!parsed.accessToken || !parsed.refreshToken || typeof parsed.expiresAt !== 'number') {
      return null;
    }
    return parsed as TokenPair;
  } catch {
    return null;
  }
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return getTokens()?.accessToken ?? null;
}

/** 만료 5초 전부터 만료 취급 — 갱신 요청 도중 실제 만료되는 경합을 줄인다. */
export function isTokenExpired(tokens: TokenPair): boolean {
  return tokens.expiresAt <= Date.now() + 5_000;
}
