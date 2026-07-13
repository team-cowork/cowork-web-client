/**
 * DataGSM OAuth2 PKCE 연동 설정.
 *
 * clientId / authApiBaseUrl 의 기본값은 rsbuild.config.ts의 AUTH_CONFIG_DEFAULTS이고,
 * 로컬에서 다른 값으로 테스트하려면 apps/shell/.env.local(gitignore)에 덮어쓰면 된다.
 * 실서버 배포 시에는 nginx가 주입하는 window.__AUTH_CONFIG__(config.js)가 최우선이다.
 */
export const AUTH_CONFIG = {
  /** DataGSM 인가 서버(외부). PKCE authorize 요청을 직접 리다이렉트하는 곳. */
  authorizeUrl: 'https://oauth.authorization.datagsm.kr/v1/oauth/authorize',
  /** Cowork 자체 Authorization API. code/verifier 교환·토큰 갱신·로그아웃을 처리. */
  get authApiBaseUrl() {
    return window.__AUTH_CONFIG__?.authApiBaseUrl ?? import.meta.env.PUBLIC_AUTH_API_BASE_URL;
  },
  get clientId() {
    return window.__AUTH_CONFIG__?.clientId ?? import.meta.env.PUBLIC_DATAGSM_CLIENT_ID;
  },
  get redirectUri() {
    return `${window.location.origin}/auth/callback`;
  },
  scope: 'self:read',
};
