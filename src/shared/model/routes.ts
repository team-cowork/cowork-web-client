import {
  ACHIEVEMENTS_PATH,
  LICENSE_PATH,
  PRIVACY_PATH,
  SIGNIN_PATH,
  TERMS_PATH,
} from '@/shared/model/paths';

export const PUBLIC_PATHS = [
  SIGNIN_PATH,
  '/auth/error',
  PRIVACY_PATH,
  TERMS_PATH,
  LICENSE_PATH,
  ACHIEVEMENTS_PATH,
];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
