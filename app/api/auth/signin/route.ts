import { type NextRequest, NextResponse } from 'next/server';

import { setPkceCookies } from '@/features/auth/lib/cookies';
import { buildAuthorizeUrl } from '@/features/auth/lib/oauth';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '@/features/auth/lib/pkce';

/**
 * PKCE 로그인 시작. code_verifier·state를 서버에서 생성해 httpOnly 쿠키로 심고,
 * code_challenge(S256)와 함께 DataGSM 인가 서버로 리다이렉트한다.
 */
export async function GET(request: NextRequest) {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  const redirectUri = new URL('/api/auth/callback', request.url).toString();
  const authorizeUrl = buildAuthorizeUrl({
    clientId: process.env.DATAGSM_CLIENT_ID ?? '',
    redirectUri,
    challenge,
    state,
  });

  const response = NextResponse.redirect(authorizeUrl);
  setPkceCookies(response, verifier, state);
  return response;
}
