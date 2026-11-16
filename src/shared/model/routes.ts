import { SIGNIN_PATH } from '@/shared/model/paths';

export const PUBLIC_PATHS = [SIGNIN_PATH, '/auth/error'];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
