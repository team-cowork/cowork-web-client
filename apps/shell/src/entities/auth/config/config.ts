export const AUTH_CONFIG = {
  authorizeUrl: 'https://oauth.authorization.datagsm.kr/v1/oauth/authorize',
  get authApiBaseUrl() {
    return window.__AUTH_CONFIG__?.authApiBaseUrl ?? import.meta.env.PUBLIC_AUTH_API_BASE_URL;
  },
  get clientId() {
    return window.__AUTH_CONFIG__?.clientId ?? import.meta.env.PUBLIC_DATAGSM_CLIENT_ID;
  },
  get redirectUri() {
    return `${window.location.origin}/auth/callback`;
  },
};
