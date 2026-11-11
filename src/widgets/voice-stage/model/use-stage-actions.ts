'use client';

import { useState } from 'react';

import {
  END_LIVE_ERRORS,
  GO_LIVE_ERRORS,
  LEAVE_WATCH_ERRORS,
  type LiveErrorMessages,
  toLiveError,
  WATCH_ERRORS,
} from '@/features/live-session/lib/live-errors';
import { useLiveSession } from '@/features/live-session/model/live-session-provider';
import {
  CAMERA_FORBIDDEN,
  toCameraError,
  VOICE_ERRORS,
} from '@/features/voice-session/lib/voice-errors';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';
import { type CameraControl } from '@/shared/model/camera-control';

interface UseStageActionsParams {
  channelId: number;
  isLiveElsewhere: boolean;
  /** 방송을 시작하기 직전에 부른다 */
  onGoLive: () => void;
}

// 음성 무대의 버튼 동작과, 진행 중 여부·컨트롤 위에 보여 줄 오류 문구를 관리한다
export function useStageActions({
  channelId,
  isLiveElsewhere,
  onGoLive,
}: UseStageActionsParams) {
  const session = useVoiceSession();
  const live = useLiveSession();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [cameraPending, setCameraPending] = useState(false);

  async function runVoice(
    action: () => Promise<void>,
    errorMessage: string = VOICE_ERRORS.join,
  ) {
    setActionError(null);
    setPending(true);

    try {
      await action();
    } catch {
      setActionError(errorMessage);
    } finally {
      setPending(false);
    }
  }

  async function runLive(
    action: () => Promise<void>,
    messages: LiveErrorMessages,
  ) {
    setActionError(null);
    setPending(true);

    try {
      await action();
    } catch (error) {
      setActionError(toLiveError(error, messages));
    } finally {
      setPending(false);
    }
  }

  async function toggleCamera() {
    setActionError(null);
    setCameraPending(true);

    try {
      await session.toggleCamera();
    } catch (error) {
      setActionError(toCameraError(error));
    } finally {
      setCameraPending(false);
    }
  }

  const cameraControl: CameraControl = {
    enabled: session.cameraEnabled,
    // 권한이 없으면 화면 공유처럼 컨트롤 위 문구로 이유를 보여 준다
    onToggle: !session.canUseCamera
      ? () => setActionError(CAMERA_FORBIDDEN)
      : cameraPending
        ? undefined
        : () => void toggleCamera(),
    unavailable: !session.canUseCamera,
  };

  function goLive() {
    onGoLive();

    return live.goLive(channelId);
  }

  return {
    pending,
    actionError,
    cameraControl,
    joinVoice: () =>
      void runVoice(async () => {
        if (isLiveElsewhere) await live.leave().catch(() => undefined);

        await session.join(channelId);
      }),
    // 마이크 전환은 다른 버튼을 막을 만큼 오래 걸리지 않아 pending을 쓰지 않는다
    toggleMic: () => {
      setActionError(null);
      void session
        .toggleMic()
        .catch(() => setActionError(VOICE_ERRORS.toggleMic));
    },
    // 음성에서 나가면 LiveVoiceGuard가 내 방송도 함께 끝낸다.
    // leave는 연결을 먼저 정리한 뒤 서버에 알리므로, 실패해도 이미 나간 상태다.
    // 남은 서버 기록은 LiveKit 웹훅이 정리하므로 오류 문구를 띄우지 않는다
    leaveVoice: () =>
      void runVoice(() => session.leave().catch(() => undefined)),
    resumeAudio: () => {
      setActionError(null);
      // 방이 없는 쪽은 바로 끝나므로 음성과 방송을 함께 다시 시도한다
      void Promise.all([session.resumeAudio(), live.resumeAudio()]).catch(() =>
        setActionError(VOICE_ERRORS.resumeAudio),
      );
    },
    watchLive: () => void runLive(() => live.watch(channelId), WATCH_ERRORS),
    leaveWatch: () => void runLive(live.leave, LEAVE_WATCH_ERRORS),
    startLive: () => runLive(goLive, GO_LIVE_ERRORS),
    endLive: () => runLive(live.leave, END_LIVE_ERRORS),
  };
}
