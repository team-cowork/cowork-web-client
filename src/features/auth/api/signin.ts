import { generateCodeChallenge, generateCodeVerifier, generateState } from '@/features/auth/lib/pkce';
import { savePkceSession } from '@/features/auth/lib/pkce-session';

const AUTHORIZE_URL = 'https://oauth.authorization.datagsm.kr/v1/oauth/authorize';

/** DataGSM 인가 서버로 리다이렉트해 PKCE 로그인 플로우를 시작한다. */
export async function startSignin() {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  savePkceSession(verifier, state);

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_DATAGSM_CLIENT_ID ?? '',
    redirect_uri: `${window.location.origin}/auth/callback`,
    response_type: 'code',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });

  window.location.assign(`${AUTHORIZE_URL}?${params.toString()}`);
}
