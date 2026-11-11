import { getHttpStatus } from '@/shared/api/http-error';
import {
  type LiveEndReason,
  type LiveRole,
} from '@/features/live-session/model/live-session-state';

export const LIVE_END_MESSAGE: Record<
  LiveRole,
  Record<LiveEndReason, string>
> = {
  host: {
    'host-ended': '방송이 종료되었습니다',
    removed: '방송에서 퇴장 처리되었습니다',
    'connection-lost': '연결이 끊겨 방송이 종료되었습니다',
  },
  viewer: {
    'host-ended': '방송이 종료되었습니다',
    removed: '방송에서 퇴장 처리되었습니다',
    'connection-lost': '연결이 끊겨 방송에서 나왔습니다',
  },
};

export interface LiveErrorMessages {
  fallback: string;
  forbidden?: string;
}

export const GO_LIVE_ERRORS: LiveErrorMessages = {
  fallback: '화면 공유를 시작하지 못했습니다',
  // 라이브 시작에는 팀·채널 역할의 live_broadcast 권한이 필요하다 (OWNER·ADMIN은 기본 보유)
  forbidden:
    '방송 권한이 없습니다. 팀 관리자에게 라이브 방송 권한을 요청하세요',
};

export const WATCH_ERRORS: LiveErrorMessages = {
  fallback: '방송에 연결하지 못했습니다',
  forbidden: '이 채널의 방송을 볼 권한이 없습니다',
};

export const LEAVE_WATCH_ERRORS: LiveErrorMessages = {
  fallback: '방송에서 나가지 못했습니다',
};

export const END_LIVE_ERRORS: LiveErrorMessages = {
  fallback: '방송을 종료하지 못했습니다',
};

export function toLiveError(
  error: unknown,
  messages: LiveErrorMessages,
): string | null {
  // 화면 선택 창에서 취소한 경우는 오류로 보지 않는다
  if (error instanceof Error && error.name === 'NotAllowedError') return null;

  const status = getHttpStatus(error);

  if (status === 403) return messages.forbidden ?? messages.fallback;
  if (status === 409) return '이 채널에서 이미 방송이 진행 중입니다';
  if (status === 404) return '방송이 이미 종료되었습니다';

  return messages.fallback;
}
