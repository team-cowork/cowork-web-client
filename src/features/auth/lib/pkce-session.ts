/**
 * authorize 리다이렉트 → callback 왕복 사이에만 살아있으면 되는 값이라 sessionStorage에 둔다.
 * code_verifier는 문서상 1회용이라 소비 즉시(consume) 삭제한다.
 */
const VERIFIER_KEY = 'datagsm_pkce_verifier';
const STATE_KEY = 'datagsm_pkce_state';

export function savePkceSession(verifier: string, state: string) {
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
}

export function consumePkceSession(): { verifier: string; state: string } | null {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  if (!verifier || !state) return null;
  return { verifier, state };
}
