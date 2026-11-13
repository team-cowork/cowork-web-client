'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { voiceQueries } from '@/entities/voice/api/voice-queries';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';

export interface VoiceChannelParticipant {
  key: string;
  userId: number | null;
  speaking: boolean;
  muted: boolean;
}

interface UseVoiceChannelParticipantsOptions {
  /** 지정하지 않으면 voiceQueries의 기본 갱신 주기를 쓴다 */
  refetchInterval?: number;
}

// 이 채널 음성에 연결돼 있으면 방의 실시간 참가자를, 아니면 서버가 알려 준
// 참가자를 같은 모양으로 돌려준다. 미리보기를 아직 못 받았으면 undefined다
export function useVoiceChannelParticipants(
  channelId: number,
  { refetchInterval }: UseVoiceChannelParticipantsOptions = {},
) {
  const session = useVoiceSession();
  const isConnected =
    session.channelId === channelId && session.status === 'connected';

  const preview = useQuery({
    ...voiceQueries.participants(channelId),
    enabled: !isConnected,
    ...(refetchInterval === undefined ? {} : { refetchInterval }),
  });

  const sessionParticipants = session.participants;
  const previewParticipants = preview.data?.participants;
  // 말하는 사람이 바뀔 때마다 다시 렌더되므로, 원본이 같으면 변환한 배열도 재사용한다
  const participants = useMemo<VoiceChannelParticipant[] | undefined>(
    () =>
      isConnected
        ? sessionParticipants.map((participant) => ({
            key: participant.identity,
            userId: participant.userId,
            speaking: participant.speaking,
            muted: participant.muted,
          }))
        : previewParticipants?.map((participant) => ({
            key: String(participant.user_id),
            userId: participant.user_id,
            speaking: false,
            muted: false,
          })),
    [isConnected, sessionParticipants, previewParticipants],
  );

  return { isConnected, participants, preview };
}
