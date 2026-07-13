import { AUTH_CONFIG } from '../../entities/auth/config';
import { storeTokens, type TokenPairResponse } from '../../entities/auth/model';
import { consumePkceSession } from './pkce-session';

export type AuthCallbackParams = {
  code?: string;
  state?: string;
  error?: string;
};

export type AuthCallbackResult = { ok: true } | { ok: false; reason: string };

/**
 * DataGSM authorize 리다이렉트가 돌아온 뒤 code/state를 검증하고,
 * Cowork Authorization API(/auth/token)로 code ↔ code_verifier를 교환해 토큰을 발급받는다.
 * DataGSM 토큰 엔드포인트는 client_secret이 필요해 프론트가 직접 호출하지 않는다(BFF가 대행).
 */
export async function handleAuthCallback(params: AuthCallbackParams): Promise<AuthCallbackResult> {
  if (params.error) return { ok: false, reason: params.error };
  if (!params.code || !params.state) return { ok: false, reason: 'missing_code_or_state' };

  const session = consumePkceSession();
  if (!session || session.state !== params.state) {
    return { ok: false, reason: 'state_mismatch' };
  }

  const response = await fetch(`${AUTH_CONFIG.authApiBaseUrl}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: params.code,
      code_verifier: session.verifier,
      redirect_uri: AUTH_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) return { ok: false, reason: 'token_exchange_failed' };

  const data = (await response.json()) as TokenPairResponse;
  storeTokens(data);
  return { ok: true };
}
