const AUTHORIZE_URL = 'https://oauth.authorization.datagsm.kr/v1/oauth/authorize';

export function buildAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  challenge: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: 'code',
    code_challenge: input.challenge,
    code_challenge_method: 'S256',
    state: input.state,
  });

  return `${AUTHORIZE_URL}?${params.toString()}`;
}
