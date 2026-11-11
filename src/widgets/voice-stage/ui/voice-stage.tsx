'use client';

import { useEffect, useState } from 'react';

import { VoiceParticipantCard } from '@/entities/voice/ui/voice-participant-card';
import {
  END_LIVE_ERRORS,
  GO_LIVE_ERRORS,
  LEAVE_WATCH_ERRORS,
  LIVE_END_MESSAGE,
  type LiveErrorMessages,
  toLiveError,
  WATCH_ERRORS,
} from '@/features/live-session/lib/live-errors';
import { useLiveSession } from '@/features/live-session/model/live-session-provider';
import { LiveStreamFocus } from '@/features/live-session/ui/live-stream-focus';
import { LiveStreamTile } from '@/features/live-session/ui/live-stream-tile';
import {
  CAMERA_FORBIDDEN,
  toCameraError,
  VOICE_ERRORS,
} from '@/features/voice-session/lib/voice-errors';
import { type VoiceChannelParticipant } from '@/features/voice-session/model/use-voice-channel-participants';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';
import { VoiceControls } from '@/features/voice-session/ui/voice-controls';
import { cn } from '@/shared/lib/cn';
import { type CameraControl } from '@/shared/model/camera-control';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';
import { MonitorIcon } from '@/shared/ui/icons/monitor-icon';
import { useVoiceStageView } from '@/widgets/voice-stage/model/use-voice-stage-view';
import { LiveFocusFooter } from '@/widgets/voice-stage/ui/live-focus-footer';

export interface VoiceStageProps {
  channelId: number;
  className?: string;
}

export function VoiceStage({ channelId, className }: VoiceStageProps) {
  const session = useVoiceSession();
  const live = useLiveSession();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [focusOwnStream, setFocusOwnStream] = useState(false);
  const [cameraPending, setCameraPending] = useState(false);

  // 음성 연결은 다른 화면에서도 유지되지만, 카메라는 켜져 있다는 표시와 끌
  // 수단이 이 화면에만 있다. 모르는 사이 영상이 나가지 않게 벗어나면 끈다
  const { stopCamera } = session;

  useEffect(
    () => () => {
      void stopCamera().catch(() => undefined);
    },
    [channelId, stopCamera],
  );

  const {
    isConnected,
    isConnecting,
    isBusyElsewhere,
    isStreaming,
    isWatching,
    isLiveConnecting,
    isLiveElsewhere,
    preview,
    me,
    endedLive,
    liveHostUserId,
    liveViewerCount,
    liveStartedAt,
    showLiveTile,
    cameraByUserId,
    stage,
    userById,
    liveHostName,
    showFocus,
    showPreviewPending,
    showPreviewError,
    canShareScreen,
  } = useVoiceStageView(channelId, focusOwnStream);

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
    setFocusOwnStream(false);

    return live.goLive(channelId);
  }

  function renderLiveTile() {
    if (isStreaming)
      return (
        <LiveStreamTile
          hostName={liveHostName}
          viewerCount={liveViewerCount}
          startedAt={liveStartedAt}
          isMine
          previewTrack={live.screenShareTrack}
          actionLabel="크게 보기"
          onAction={() => setFocusOwnStream(true)}
        />
      );

    return (
      <LiveStreamTile
        hostName={liveHostName}
        viewerCount={liveViewerCount}
        startedAt={liveStartedAt}
        isMine={false}
        actionLabel={isLiveConnecting ? '연결 중…' : '방송 보기'}
        onAction={() => void runLive(() => live.watch(channelId), WATCH_ERRORS)}
        // 내 정보를 모르면 내 방송인지 판단할 수 없어, 호스트가 시청자로
        // 들어가 화면 없는 방송 상태가 되지 않도록 불러올 때까지 막는다
        disabled={pending || isLiveConnecting || me.data === undefined}
      />
    );
  }

  function renderParticipantCard(participant: VoiceChannelParticipant) {
    const camera =
      participant.userId === null
        ? undefined
        : cameraByUserId.get(participant.userId);

    return (
      <VoiceParticipantCard
        user={
          participant.userId === null
            ? undefined
            : userById.get(participant.userId)
        }
        fallbackName={
          participant.userId === null
            ? participant.key
            : `#${participant.userId}`
        }
        speaking={participant.speaking}
        muted={participant.muted}
        live={showLiveTile && participant.userId === liveHostUserId}
        videoTrack={camera?.track}
        mirrored={camera?.isLocal}
      />
    );
  }

  function renderBody() {
    // 보던 방송이 끝나면 그 자리에서 바로 알 수 있게 크게 알린다
    if (endedLive)
      return (
        <EmptyState
          icon={<MonitorIcon />}
          title={LIVE_END_MESSAGE[endedLive.role][endedLive.reason]}
          description={
            endedLive.role === 'viewer' && endedLive.reason === 'host-ended'
              ? `${liveHostName}님이 화면 공유를 종료했습니다`
              : undefined
          }
          className="max-w-md"
          action={
            <Button size="S" variant="weak" onClick={live.dismiss}>
              확인
            </Button>
          }
        />
      );

    if (showFocus)
      return (
        <LiveStreamFocus
          track={live.screenShareTrack}
          title={isStreaming ? '내 화면' : `${liveHostName}님의 화면`}
          viewerCount={liveViewerCount}
          startedAt={liveStartedAt}
          audioEnabled={live.audioEnabled}
          onToggleAudio={isWatching ? live.toggleAudio : undefined}
          closeLabel={isWatching ? '나가기' : '작게 보기'}
          onClose={() =>
            isWatching
              ? void runLive(live.leave, LEAVE_WATCH_ERRORS)
              : setFocusOwnStream(false)
          }
          footer={
            stage.length > 0 && (
              <LiveFocusFooter
                participants={stage}
                userById={userById}
                cameraByUserId={cameraByUserId}
              />
            )
          }
        />
      );

    if (showPreviewPending)
      return (
        <ul className="flex w-225 max-w-full flex-wrap items-center justify-center gap-5">
          {Array.from({ length: 3 }, (_, index) => (
            <li key={index}>
              <span className="block h-49 w-70 animate-pulse rounded-2xl bg-surface-container" />
            </li>
          ))}
        </ul>
      );

    if (showPreviewError)
      return (
        <ErrorState
          title="참여자를 불러오지 못했습니다"
          description="잠시 후 다시 시도해 주세요"
          action={
            <Button size="S" variant="weak" onClick={() => preview.refetch()}>
              다시 시도
            </Button>
          }
        />
      );

    if (stage.length === 0 && !showLiveTile)
      return (
        <EmptyState
          icon={<HeadphonesIcon />}
          title="아직 참여자가 없습니다"
          description="가장 먼저 입장해 대화를 시작하세요"
          className="max-w-md"
        />
      );

    return (
      <ul className="flex w-225 max-w-full flex-wrap items-center justify-center gap-5">
        {showLiveTile && <li>{renderLiveTile()}</li>}
        {stage.map((participant) => (
          <li key={participant.key}>{renderParticipantCard(participant)}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
      <div
        className={cn(
          'flex min-h-0 flex-1 overflow-y-auto p-6',
          showFocus ? 'flex-col' : 'items-center justify-center',
        )}
      >
        {renderBody()}
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3 pt-2 pb-7">
        {actionError && (
          <p role="alert" className="typography-subtext-medium text-error">
            {actionError}
          </p>
        )}

        {((isConnected && session.audioPlaybackBlocked) ||
          (isWatching && live.audioPlaybackBlocked)) && (
          <div className="flex items-center gap-2">
            <p className="typography-subtext-medium text-on-surface-variant">
              브라우저가 소리 재생을 막았습니다.
            </p>
            <Button
              size="S"
              variant="weak"
              onClick={() =>
                // 방이 없는 쪽은 바로 끝나므로 음성과 방송을 함께 다시 시도한다
                void Promise.all([
                  session.resumeAudio(),
                  live.resumeAudio(),
                ]).catch(() => setActionError(VOICE_ERRORS.resumeAudio))
              }
            >
              소리 켜기
            </Button>
          </div>
        )}

        {isBusyElsewhere && (
          <p className="typography-subtext-medium text-on-surface-variant">
            다른 채널의 음성에 연결되어 있습니다. 참여하면 기존 연결이
            종료됩니다.
          </p>
        )}

        {!isConnected && isLiveElsewhere && (
          <p className="typography-subtext-medium text-on-surface-variant">
            다른 채널의 방송에 연결되어 있습니다. 참여하면 방송 연결이
            종료됩니다.
          </p>
        )}

        {isConnected && !canShareScreen && (
          <p className="typography-subtext-medium text-on-surface-variant">
            채널당 방송은 하나만 할 수 있어 지금은 화면을 공유할 수 없습니다.
          </p>
        )}

        {isConnected ? (
          <VoiceControls
            micEnabled={session.micEnabled}
            // 마이크 전환은 다른 버튼을 막을 만큼 오래 걸리지 않아 pending을 쓰지 않는다
            onToggleMic={() => {
              setActionError(null);
              void session
                .toggleMic()
                .catch(() => setActionError(VOICE_ERRORS.toggleMic));
            }}
            audioEnabled={session.audioEnabled}
            onToggleAudio={session.toggleAudio}
            camera={cameraControl}
            screenSharing={isStreaming}
            onShareScreen={
              canShareScreen && !isLiveConnecting
                ? () =>
                    void (isStreaming
                      ? runLive(live.leave, END_LIVE_ERRORS)
                      : runLive(goLive, GO_LIVE_ERRORS))
                : undefined
            }
            // 음성에서 나가면 LiveVoiceGuard가 내 방송도 함께 끝낸다
            // leave는 연결을 먼저 정리한 뒤 서버에 알리므로, 실패해도 이미 나간 상태다.
            // 남은 서버 기록은 LiveKit 웹훅이 정리하므로 오류 문구를 띄우지 않는다
            onLeave={() =>
              void runVoice(() => session.leave().catch(() => undefined))
            }
          />
        ) : (
          <Button
            onClick={() =>
              void runVoice(async () => {
                if (isLiveElsewhere) await live.leave().catch(() => undefined);

                await session.join(channelId);
              })
            }
            disabled={pending || isConnecting}
          >
            {isConnecting ? '연결 중…' : '음성 채널 참여'}
          </Button>
        )}
      </div>
    </div>
  );
}
