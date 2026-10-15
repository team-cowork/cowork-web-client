import { type NextRequest } from 'next/server';

export function appUrl(path: string, request: NextRequest) {
  return new URL(path, process.env.APP_ORIGIN ?? request.url);
}
