import { SIGNIN_PATH, WELCOME_PATH } from '@/shared/model/paths';

export const PUBLIC_PATHS = [WELCOME_PATH, SIGNIN_PATH, '/auth/error'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
