'use client';

import { useEffect, useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { liveQueries } from '@/entities/live/api/live-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { voiceQueries } from '@/entities/voice/api/voice-queries';
import { VoiceParticipantCard } from '@/entities/voice/ui/voice-participant-card';
import { useLiveSession } from '@/features/live-session/model/live-session-provider';
import {
  type LiveEndReason,
  type LiveRole,
} from '@/features/live-session/model/live-session-state';
import { LiveStreamFocus } from '@/features/live-session/ui/live-stream-focus';
import { LiveStreamTile } from '@/features/live-session/ui/live-stream-tile';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';
import { VoiceControls } from '@/features/voice-session/ui/voice-controls';
import { cn } from '@/shared/lib/cn';
import { type CameraControl } from '@/shared/model/camera-control';
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';
import { MonitorIcon } from '@/shared/ui/icons/monitor-icon';
import { TrackVideo } from '@/shared/ui/track-video';

export interface VoiceStageProps {
  channelId: number;
  className?: string;
}

interface StageParticipant {
  key: string;
  userId: number | null;
  speaking: boolean;
  muted: boolean;
}

const LIVE_END_MESSAGE: Record<LiveRole, Record<LiveEndReason, string>> = {
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

interface LiveErrorMessages {
  fallback: string;
  forbidden?: string;
}

const GO_LIVE_ERRORS: LiveErrorMessages = {
  fallback: '화면 공유를 시작하지 못했습니다',
  // 라이브 시작에는 팀·채널 역할의 live_broadcast 권한이 필요하다 (OWNER·ADMIN은 기본 보유)
  forbidden:
    '방송 권한이 없습니다. 팀 관리자에게 라이브 방송 권한을 요청하세요',
};

const WATCH_ERRORS: LiveErrorMessages = {
  fallback: '방송에 연결하지 못했습니다',
  forbidden: '이 채널의 방송을 볼 권한이 없습니다',
};

// 카메라 송출은 서버가 screen_share 권한으로 판정한다
const CAMERA_FORBIDDEN =
  '카메라 권한이 없습니다. 팀 관리자에게 화면 공유 권한을 요청하세요';

function toCameraError(error: unknown): string {
  const name = error instanceof Error ? error.name : undefined;

  if (name === 'NotAllowedError')
    return '브라우저에서 카메라가 차단되어 있습니다. 주소창의 사이트 설정에서 허용해 주세요';
  if (name === 'NotFoundError') return '연결된 카메라를 찾지 못했습니다';
  if (name === 'NotReadableError')
    return '다른 앱이 카메라를 사용하고 있습니다';

  return '카메라를 켜지 못했습니다';
}

function toLiveError(
  error: unknown,
  messages: LiveErrorMessages,
): string | null {
  // 화면 선택 창에서 취소한 경우는 오류로 보지 않는다
  if (error instanceof Error && error.name === 'NotAllowedError') return null;

  const status = isAxiosError(error) ? error.response?.status : undefined;

  if (status === 403) return messages.forbidden ?? messages.fallback;
  if (status === 409) return '이 채널에서 이미 방송이 진행 중입니다';
  if (status === 404) return '방송이 이미 종료되었습니다';

  return messages.fallback;
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

  const isCurrentChannel = session.channelId === channelId;
  const isConnected = isCurrentChannel && session.status === 'connected';
  const isConnecting = isCurrentChannel && session.status === 'connecting';
  const isBusyElsewhere = session.channelId !== null && !isCurrentChannel;

  const liveState = live.state;
  const isLiveChannel = live.channelId === channelId;
  const activeLive =
    isLiveChannel &&
    (liveState.status === 'broadcasting' || liveState.status === 'watching')
      ? liveState
      : null;
  const isStreaming = activeLive?.status === 'broadcasting';
  const isWatching = activeLive?.status === 'watching';
  const isLiveConnecting = isLiveChannel && liveState.status === 'connecting';
  const isLiveElsewhere =
    live.channelId !== null && !isLiveChannel && liveState.status !== 'ended';

  const preview = useQuery({
    ...voiceQueries.participants(channelId),
    enabled: !isConnected,
  });
  const liveStatus = useQuery({
    ...liveQueries.status(channelId),
    enabled: activeLive === null,
  });
  const me = useQuery(userQueries.me());

  const hasLive = activeLive !== null || liveStatus.data?.live === true;
  const endedLive =
    isLiveChannel && liveState.status === 'ended' ? liveState : null;
  const liveHostUserId = activeLive
    ? activeLive.hostUserId
    : (endedLive?.hostUserId ?? liveStatus.data?.host_user_id ?? null);
  const liveViewerCount = activeLive
    ? live.participants.filter(
        (participant) => participant.userId !== activeLive.hostUserId,
      ).length
    : (liveStatus.data?.viewer_count ?? 0);
  const liveStartedAt =
    hasLive && liveStatus.data?.live ? liveStatus.data.started_at : undefined;
  const isMyLive = liveHostUserId !== null && me.data?.id === liveHostUserId;
  // 새로고침 등으로 연결이 끊긴 내 방송은 서버가 방을 지우는 중이라 이어갈 수
  // 없다. 다음 갱신에서 사라질 때까지 시청 타일로도 보여 주지 않는다
  const showLiveTile = hasLive && (activeLive !== null || !isMyLive);
  // 카메라는 음성 방으로 송출되므로 이 채널 음성에 연결돼 있을 때만 보인다
  const cameraByUserId = new Map(
    (isConnected ? session.cameras : []).flatMap((camera) =>
      camera.userId === null ? [] : [[camera.userId, camera]],
    ),
  );

  const stage: StageParticipant[] = isConnected
    ? session.participants.map((participant) => ({
        key: participant.identity,
        userId: participant.userId,
        speaking: participant.speaking,
        muted: participant.muted,
      }))
    : (preview.data?.participants ?? []).map((participant) => ({
        key: String(participant.user_id),
        userId: participant.user_id,
        speaking: false,
        muted: false,
      }));

  const userIds = Array.from(
    new Set(
      [
        ...stage.map((participant) => participant.userId),
        liveHostUserId,
      ].filter((id) => id !== null),
    ),
  );
  const users = useQueries({
    queries: userIds.map((userId) => userQueries.detail(userId)),
  });
  const userById = new Map(
    users.flatMap((result) =>
      result.data ? [[result.data.id, result.data]] : [],
    ),
  );

  const liveHost =
    liveHostUserId === null ? undefined : userById.get(liveHostUserId);
  const liveHostName =
    liveHost?.nickname ?? liveHost?.name ?? `#${liveHostUserId ?? ''}`;

  const showFocus = isWatching || (isStreaming && focusOwnStream);
  const showPreviewPending = !isConnected && preview.isPending;
  const showPreviewError = !isConnected && preview.isError;
  const canShareScreen = isStreaming || !hasLive || isMyLive;

  async function runVoice(
    action: () => Promise<void>,
    errorMessage = '음성 채널에 연결하지 못했습니다',
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

  function renderParticipantCard(participant: StageParticipant) {
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
              ? void runLive(live.leave, {
                  fallback: '방송에서 나가지 못했습니다',
                })
              : setFocusOwnStream(false)
          }
          footer={
            stage.length > 0 && (
              <ul className="flex shrink-0 justify-center gap-3 overflow-x-auto">
                {stage.map((participant) => {
                  const user =
                    participant.userId === null
                      ? undefined
                      : userById.get(participant.userId);
                  const camera =
                    participant.userId === null
                      ? undefined
                      : cameraByUserId.get(participant.userId);
                  const name =
                    user?.nickname ??
                    user?.name ??
                    `#${participant.userId ?? participant.key}`;

                  return (
                    <li key={participant.key} title={name}>
                      <span
                        className={cn(
                          'relative flex h-20 w-36 items-center justify-center overflow-hidden rounded-xl border-2 bg-surface-container',
                          participant.speaking
                            ? 'border-cowork-green-500'
                            : 'border-transparent',
                        )}
                      >
                        {camera ? (
                          <TrackVideo
                            track={camera.track}
                            fit="cover"
                            mirrored={camera.isLocal}
                            className="rounded-none"
                          />
                        ) : (
                          <Avatar
                            src={user?.profile_image_url ?? undefined}
                            name={user?.name ?? name}
                            size={40}
                            shape="circle"
                          />
                        )}
                        <span className="absolute bottom-1 left-1.5 max-w-[calc(100%-0.75rem)] truncate rounded bg-black/60 px-1.5 typography-subtext-small text-white">
                          {name}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
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
            onToggleMic={() =>
              void runVoice(
                session.toggleMic,
                '마이크 상태를 바꾸지 못했습니다',
              )
            }
            audioEnabled={session.audioEnabled}
            onToggleAudio={session.toggleAudio}
            camera={cameraControl}
            screenSharing={isStreaming}
            onShareScreen={
              canShareScreen && !isLiveConnecting
                ? () =>
                    void (isStreaming
                      ? runLive(live.leave, {
                          fallback: '방송을 종료하지 못했습니다',
                        })
                      : runLive(goLive, GO_LIVE_ERRORS))
                : undefined
            }
            // 음성에서 나가면 LiveVoiceGuard가 내 방송도 함께 끝낸다
            onLeave={() =>
              void runVoice(session.leave, '음성 채널에서 나가지 못했습니다')
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
