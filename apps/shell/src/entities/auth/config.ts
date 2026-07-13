/**
 * DataGSM OAuth2 PKCE 연동 설정.
 *
 * clientId / authApiBaseUrl 은 배포 환경마다 달라 nginx가 주입하는
 * window.__AUTH_CONFIG__(config.js)를 우선 사용하고, 로컬 dev 서버(rsbuild)에는
 * config.js가 없으므로 DEV_DEFAULTS로 폴백한다.
 */
const DEV_DEFAULTS = {
  clientId: 'cowork-shell-dev',
  authApiBaseUrl: 'https://ssh.gsmsv.site:22132/api',
};

export const AUTH_CONFIG = {
  /** DataGSM 인가 서버(외부). PKCE authorize 요청을 직접 리다이렉트하는 곳. */
  authorizeUrl: 'https://oauth.authorization.datagsm.kr/v1/oauth/authorize',
  /** Cowork 자체 Authorization API. code/verifier 교환·토큰 갱신·로그아웃을 처리. */
  get authApiBaseUrl() {
    return window.__AUTH_CONFIG__?.authApiBaseUrl ?? DEV_DEFAULTS.authApiBaseUrl;
  },
  get clientId() {
    return window.__AUTH_CONFIG__?.clientId ?? DEV_DEFAULTS.clientId;
  },
  get redirectUri() {
    return `${window.location.origin}/auth/callback`;
  },
  scope: 'self:read',
};
