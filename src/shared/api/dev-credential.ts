import { type InternalAxiosRequestConfig } from 'axios';

// 운영 빌드에서는 NODE_ENV 분기가 상수로 접혀 값이 번들에 포함되지 않는다
const DEV_CREDENTIAL =
  process.env.NODE_ENV === 'production'
    ? undefined
    : process.env.NEXT_PUBLIC_DEV_CREDENTIAL || undefined;

export const devCredentialQuery: Record<string, string> = DEV_CREDENTIAL
  ? { dev_credential: DEV_CREDENTIAL }
  : {};

export function applyDevCredential(config: InternalAxiosRequestConfig) {
  if (DEV_CREDENTIAL) {
    config.params = { ...config.params, ...devCredentialQuery };
  }

  return config;
}

// 서명된 쿼리를 다시 인코딩하지 않도록 URL 객체 대신 문자열로 덧붙인다
export function withDevCredential(url: string): string {
  if (!DEV_CREDENTIAL) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}dev_credential=${encodeURIComponent(DEV_CREDENTIAL)}`;
}
