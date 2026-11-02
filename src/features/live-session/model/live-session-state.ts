export type LiveRole = 'host' | 'viewer';

export type LiveEndReason = 'host-ended' | 'removed' | 'connection-lost';

export type LiveSessionState =
  | { status: 'idle' }
  | { status: 'connecting'; channelId: number; intent: 'start' | 'join' }
  | {
      status: 'broadcasting';
      channelId: number;
      sessionId: string;
      hostUserId: number | null;
    }
  | {
      status: 'watching';
      channelId: number;
      sessionId: string;
      hostUserId: number;
    }
  | {
      status: 'ended';
      channelId: number;
      role: LiveRole;
      reason: LiveEndReason;
      hostUserId: number | null;
    };

export type LiveSessionStatus = LiveSessionState['status'];

export type LiveSessionEvent =
  | { type: 'START'; channelId: number }
  | { type: 'JOIN'; channelId: number }
  | {
      type: 'CONNECTED';
      sessionId: string;
      role: LiveRole;
      hostUserId: number | null;
    }
  | { type: 'CONNECT_FAILED' }
  | { type: 'LEAVE' }
  | { type: 'FORCE_ENDED'; reason: LiveEndReason }
  | { type: 'DISMISS' };

export const INITIAL_LIVE_SESSION_STATE: LiveSessionState = { status: 'idle' };

// | 현재            | 이벤트        | 다음                                      |
// | --------------- | ------------- | ----------------------------------------- |
// | idle · ended    | START / JOIN  | connecting                                |
// | connecting      | CONNECTED     | broadcasting(host) · watching(viewer)     |
// | connecting      | CONNECT_FAILED| idle                                      |
// | broadcasting    | LEAVE         | idle (서버가 방을 지워 시청자 전원 퇴장)  |
// | watching        | LEAVE         | idle                                      |
// | broadcasting    | FORCE_ENDED   | ended                                     |
// | watching        | FORCE_ENDED   | ended (호스트 퇴장 → ROOM_DELETED)        |
// | ended           | DISMISS       | idle                                      |
// 표에 없는 조합은 무시한다
export function liveSessionReducer(
  state: LiveSessionState,
  event: LiveSessionEvent,
): LiveSessionState {
  switch (event.type) {
    case 'START':
    case 'JOIN':
      if (state.status !== 'idle' && state.status !== 'ended') return state;

      return {
        status: 'connecting',
        channelId: event.channelId,
        intent: event.type === 'START' ? 'start' : 'join',
      };

    case 'CONNECTED':
      if (state.status !== 'connecting') return state;

      if (event.role === 'host')
        return {
          status: 'broadcasting',
          channelId: state.channelId,
          sessionId: event.sessionId,
          hostUserId: event.hostUserId,
        };

      if (event.hostUserId === null) return state;

      return {
        status: 'watching',
        channelId: state.channelId,
        sessionId: event.sessionId,
        hostUserId: event.hostUserId,
      };

    case 'CONNECT_FAILED':
      return state.status === 'connecting' ? INITIAL_LIVE_SESSION_STATE : state;

    case 'LEAVE':
      return state.status === 'idle' ? state : INITIAL_LIVE_SESSION_STATE;

    case 'FORCE_ENDED':
      if (state.status !== 'broadcasting' && state.status !== 'watching')
        return state;

      return {
        status: 'ended',
        channelId: state.channelId,
        role: state.status === 'broadcasting' ? 'host' : 'viewer',
        reason: event.reason,
        hostUserId: state.hostUserId,
      };

    case 'DISMISS':
      return state.status === 'ended' ? INITIAL_LIVE_SESSION_STATE : state;
  }
}

export function getLiveChannelId(state: LiveSessionState): number | null {
  return state.status === 'idle' ? null : state.channelId;
}
