'use client';

import { useQueries, useQuery } from '@tanstack/react-query';

import { liveQueries } from '@/entities/live/api/live-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { userDisplayName } from '@/entities/user/lib/user-display';
import { countLiveViewers } from '@/features/live-session/lib/count-live-viewers';
import { useLiveSession } from '@/features/live-session/model/live-session-provider';
import { useVoiceChannelParticipants } from '@/features/voice-session/model/use-voice-channel-participants';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';

// 음성·방송 세션과 서버 조회 결과를 묶어 음성 무대가 그릴 상태를 계산한다
export function useVoiceStageView(channelId: number, focusOwnStream: boolean) {
  const session = useVoiceSession();
  const live = useLiveSession();

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

  const { participants, preview } = useVoiceChannelParticipants(channelId);
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
    ? countLiveViewers(live.participants, activeLive.hostUserId)
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

  const stage = participants ?? [];

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
  const liveHostName = userDisplayName(liveHost, `#${liveHostUserId ?? ''}`);

  const showFocus = isWatching || (isStreaming && focusOwnStream);
  const showPreviewPending = !isConnected && preview.isPending;
  const showPreviewError = !isConnected && preview.isError;
  const canShareScreen = isStreaming || !hasLive || isMyLive;

  return {
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
  };
}
