import { io, type Socket } from 'socket.io-client';

import { devCredentialQuery } from '@/shared/api/dev-credential';
import { issueWsCookie } from '@/shared/api/ws-cookie';
import { ACCESS_TOKEN_STORAGE_KEY } from '@/shared/model/token';

const CHAT_NAMESPACE = '/chat';
const CHAT_SOCKET_PATH = '/ws/chat';
const RETRY_BASE_DELAY_MS = 1000;
const RETRY_MAX_DELAY_MS = 30_000;
// 서버가 핸드셰이크 인증에 실패했을 때 보내는 `connect_error` 메시지의 접두어
const AUTH_FAILED_PREFIX = '인증 실패';

let socket: Socket | null = null;
// 같은 채널 room을 여러 화면이 함께 쓸 수 있어 참가 수를 센다.
const channelRoomCounts = new Map<number, number>();

let closed = false;
let retryCount = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

function socketOrigin(): string {
  return new URL(process.env.NEXT_PUBLIC_BASE_URL ?? window.location.origin)
    .origin;
}

/**
 * 인증 쿠키를 받은 뒤에 연결한다. 게이트웨이는 핸드셰이크를 이 쿠키로만 인증한다.
 * `renewToken`이면 저장된 토큰을 버려, 쿠키를 받는 요청이 토큰 갱신부터 거치게 한다.
 */
async function connectWithCookie(target: Socket, renewToken = false) {
  try {
    if (renewToken) sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    await issueWsCookie();
  } catch {
    scheduleReconnect(target, false);
    return;
  }

  if (!closed && !target.connected) target.connect();
}

/**
 * 인증 실패는 토큰이 만료됐을 수 있어 바로 토큰부터 갱신해 다시 연결한다.
 * 그 밖의 실패(서버 준비 중, 네트워크 끊김)와 반복된 인증 실패는 간격을 늘려 가며 다시 시도한다.
 */
function scheduleReconnect(target: Socket, authFailed: boolean) {
  if (closed || retryTimer) return;

  const renewToken = authFailed && retryCount === 0;
  const delay = renewToken
    ? 0
    : Math.min(RETRY_BASE_DELAY_MS * 2 ** retryCount, RETRY_MAX_DELAY_MS);
  retryCount += 1;

  retryTimer = setTimeout(() => {
    retryTimer = undefined;
    void connectWithCookie(target, renewToken);
  }, delay);
}

function createChatSocket(): Socket {
  const created = io(`${socketOrigin()}${CHAT_NAMESPACE}`, {
    path: CHAT_SOCKET_PATH,
    // HTTP 롱폴링은 게이트웨이와 chat 서비스가 CORS 헤더를 각각 붙여 브라우저가 거부한다.
    // WebSocket은 CORS 검사를 받지 않고, 여러 replica 사이 sticky session도 필요 없다.
    transports: ['websocket'],
    query: devCredentialQuery,
    // 연결 전에 인증 쿠키를 받아야 하므로 연결과 재연결 시점을 직접 정한다.
    autoConnect: false,
    reconnection: false,
  });

  // 연결이 끊기면 서버 쪽 room 참가도 사라지므로 다시 연결될 때마다 참가 중인 room에 다시 들어간다.
  created.on('connect', () => {
    retryCount = 0;
    channelRoomCounts.forEach((_, channelId) =>
      created.emit('join', { channelId }),
    );
  });

  created.on('connect_error', (error) => {
    scheduleReconnect(created, error.message.startsWith(AUTH_FAILED_PREFIX));
  });

  created.on('disconnect', (reason) => {
    if (reason !== 'io client disconnect') scheduleReconnect(created, false);
  });

  void connectWithCookie(created);
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

/** 로그아웃할 때 연결을 끊고 다시 연결하지 않는다. */
export function closeChatSocket() {
  closed = true;
  clearTimeout(retryTimer);
  retryTimer = undefined;
  socket?.disconnect();
}

/**
 * 채널 room에 참가하고, 참가를 끝내는 함수를 돌려준다.
 * 마지막 사용처가 끝낼 때만 room을 떠나, 같은 room을 쓰는 다른 화면이 이벤트를 잃지 않게 한다.
 */
export function joinChannelRoom(channelId: number): () => void {
  const chatSocket = getChatSocket();
  const count = channelRoomCounts.get(channelId) ?? 0;
  channelRoomCounts.set(channelId, count + 1);
  if (count === 0 && chatSocket.connected) {
    chatSocket.emit('join', { channelId });
  }

  let left = false;
  return () => {
    if (left) return;
    left = true;

    const remaining = (channelRoomCounts.get(channelId) ?? 1) - 1;
    if (remaining > 0) {
      channelRoomCounts.set(channelId, remaining);
      return;
    }

    channelRoomCounts.delete(channelId);
    if (chatSocket.connected) chatSocket.emit('leave', { channelId });
  };
}
