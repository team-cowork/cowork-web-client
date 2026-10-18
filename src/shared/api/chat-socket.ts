import { io, type Socket } from 'socket.io-client';

import { devCredentialQuery } from '@/shared/api/dev-credential';
import { refreshAccessToken } from '@/shared/api/instance';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/shared/model/token';

const CHAT_NAMESPACE = '/chat';
const CHAT_SOCKET_PATH = '/ws/chat';
const RECONNECT_RETRY_DELAY_MS = 5000;
// 서버가 인증 실패 시 보내는 `exception` 메시지의 접두어
const AUTH_FAILED_PREFIX = '인증 실패';

let socket: Socket | null = null;

function socketOrigin(): string {
  return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin)
    .origin;
}

function createChatSocket(): Socket {
  const created = io(`${socketOrigin()}${CHAT_NAMESPACE}`, {
    path: CHAT_SOCKET_PATH,
    // HTTP 롱폴링은 게이트웨이와 chat 서비스가 CORS 헤더를 각각 붙여 브라우저가 거부한다.
    // WebSocket은 CORS 검사를 받지 않고, 여러 replica 사이 sticky session도 필요 없다.
    transports: ['websocket'],
    query: devCredentialQuery,
    // 브라우저 WebSocket은 Authorization 헤더를 실을 수 없어 핸드셰이크 auth로 JWT를 넘긴다.
    // 재연결마다 다시 호출되므로 그 사이 갱신된 토큰이 반영된다.
    auth: (cb) => {
      const stored = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (stored) {
        cb({ token: stored });
        return;
      }

      refreshAccessToken().then(
        (token) => cb({ token }),
        () => cb({}),
      );
    },
  });

  let retried = false;
  let authFailed = false;

  created.on('connect', () => {
    retried = false;
    authFailed = false;
  });

  created.on('exception', (payload: { message?: string }) => {
    authFailed = payload.message?.startsWith(AUTH_FAILED_PREFIX) ?? false;
  });

  // 서버는 인증 실패·준비 중일 때 `exception`을 보낸 뒤 연결을 끊고, 이 경우 클라이언트는 자동 재연결하지 않는다.
  // 인증 실패라면 만료된 토큰일 수 있으니 저장된 토큰을 버려 갱신을 거치게 한 뒤 다시 연결한다.
  created.on('disconnect', (reason) => {
    if (reason !== 'io server disconnect') return;

    if (authFailed) sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    const delay = retried ? RECONNECT_RETRY_DELAY_MS : 0;
    retried = true;
    setTimeout(() => created.connect(), delay);
  });

  return created;
}

/**
 * 채팅 실시간 이벤트용 Socket.IO 연결을 앱 전체에서 하나만 유지한다.
 * 채널을 옮겨 다닐 때마다 다시 연결하지 않도록 한 번 열면 닫지 않는다.
 */
export function getChatSocket(): Socket {
  socket ??= createChatSocket();
  return socket;
}
