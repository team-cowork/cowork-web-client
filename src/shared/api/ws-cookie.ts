import axios from 'axios';

import { devCredentialQuery } from '@/shared/api/dev-credential';
import { instance } from '@/shared/api/instance';

const WS_COOKIE_PATH = '/auth/ws-cookie';

/**
 * 채팅 소켓 핸드셰이크에 실릴 인증 쿠키를 API 도메인에 받는다.
 * 쿠키는 이 응답을 받은 브라우저에만 저장되므로 Next 서버를 거치지 않고 브라우저에서 직접 호출한다.
 * 쿠키 수명은 액세스 토큰의 남은 유효시간까지라, 소켓을 연결할 때마다 다시 받는다.
 */
export async function issueWsCookie(): Promise<void> {
  await instance.post(WS_COOKIE_PATH, undefined, { withCredentials: true });
}

/** 로그아웃할 때 소켓 인증 쿠키를 지운다. 세션이 만료돼도 지울 수 있도록 토큰 없이 호출한다. */
export async function clearWsCookie(): Promise<void> {
  await axios.delete(WS_COOKIE_PATH, {
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    params: devCredentialQuery,
    withCredentials: true,
  });
}
