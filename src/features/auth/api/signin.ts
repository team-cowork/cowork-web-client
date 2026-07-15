import { AUTH_CONFIG } from '@/entities/auth/config/config';
import { generateCodeChallenge, generateCodeVerifier, generateState } from '@/features/auth/lib/pkce';
import { savePkceSession } from '@/features/auth/lib/pkce-session';

/** DataGSM 인가 서버로 리다이렉트해 PKCE 로그인 플로우를 시작한다. */
export async function startSignin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  savePkceSession(verifier, state);

  const params = new URLSearchParams({
    client_id: AUTH_CONFIG.clientId,
    redirect_uri: AUTH_CONFIG.redirectUri,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });

  window.location.assign(`${AUTH_CONFIG.authorizeUrl}?${params.toString()}`);
}
