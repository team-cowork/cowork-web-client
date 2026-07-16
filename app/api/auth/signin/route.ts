import { type NextRequest, NextResponse } from "next/server";

import { setPkceCookies } from "@/shared/auth/lib/cookies";
import { buildAuthorizeUrl } from "@/shared/auth/lib/oauth";
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/shared/auth/lib/pkce";

export async function GET(request: NextRequest) {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateState();

  const redirectUri = new URL("/api/auth/callback", request.url).toString();
  const authorizeUrl = buildAuthorizeUrl({
    clientId: process.env.DATAGSM_CLIENT_ID ?? "",
    redirectUri,
    challenge,
    state,
  });

  const response = NextResponse.redirect(authorizeUrl);
  setPkceCookies(response, verifier, state);
  return response;
}
