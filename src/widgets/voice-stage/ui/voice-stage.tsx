'use client';

import { useState } from 'react';

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
import { Avatar } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';
import { MonitorIcon } from '@/shared/ui/icons/monitor-icon';

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
  // 새로고침 등으로 연결만 끊기고 서버에는 남아 있는 내 방송
  const isOrphanedMyLive = hasLive && activeLive === null && isMyLive;

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

  async function runVoice(action: () => Promise<void>) {
    setActionError(null);
    setPending(true);

    try {
      await action();
    } catch {
      setActionError('음성 채널에 연결하지 못했습니다');
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

  function goLive() {
    setFocusOwnStream(false);

    return live.goLive(channelId, { resume: isOrphanedMyLive });
  }

  function renderLiveTile() {
    if (!hasLive) return null;

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

    if (isOrphanedMyLive)
      return (
        <LiveStreamTile
          hostName={liveHostName}
          viewerCount={liveViewerCount}
          startedAt={liveStartedAt}
          isMine
          // 디스코드처럼 방송은 같은 채널 음성에 참여한 상태에서만 할 수 있다
          actionLabel={isConnected ? '다시 공유' : '음성 참여 후 공유 가능'}
          onAction={() => void runLive(goLive, GO_LIVE_ERRORS)}
          disabled={pending || !isConnected}
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
        live={hasLive && participant.userId === liveHostUserId}
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

                  return (
                    <li key={participant.key}>
                      <span
                        className={cn(
                          'inline-flex rounded-full border-2 p-0.5',
                          participant.speaking
                            ? 'border-cowork-green-500'
                            : 'border-transparent',
                        )}
                      >
                        <Avatar
                          src={user?.profile_image_url ?? undefined}
                          name={user?.name ?? `#${participant.userId ?? ''}`}
                          size={40}
                          shape="circle"
                        />
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

    if (stage.length === 0 && !hasLive)
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
        {hasLive && <li>{renderLiveTile()}</li>}
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
            onToggleMic={() => void runVoice(session.toggleMic)}
            audioEnabled={session.audioEnabled}
            onToggleAudio={session.toggleAudio}
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
            onLeave={() =>
              void runVoice(async () => {
                // 디스코드처럼 음성에서 나가면 내 방송도 함께 끝낸다
                if (isStreaming) await live.leave().catch(() => undefined);

                await session.leave();
              })
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
