/**
 * DataGSM PKCE 연동 설정.
 *
 * clientId·authApiBaseUrl은 배포 환경마다 달라지므로 빌드 타임 환경 변수
 * (NEXT_PUBLIC_*)로 주입한다. redirectUri는 실행 중인 오리진 기준으로 계산하므로
 * 브라우저에서만 접근한다(로그인/콜백 등 클라이언트 흐름에서만 호출).
 */
export const AUTH_CONFIG = {
  authorizeUrl: 'https://oauth.authorization.datagsm.kr/v1/oauth/authorize',
  get authApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_AUTH_API_BASE_URL ?? '';
  },
  get clientId(): string {
    return process.env.NEXT_PUBLIC_DATAGSM_CLIENT_ID ?? '';
  },
  get redirectUri(): string {
    return `${window.location.origin}/auth/callback`;
  },
};
