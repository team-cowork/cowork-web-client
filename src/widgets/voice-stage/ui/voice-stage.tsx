'use client';

import { useState } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import { userQueries } from '@/entities/user/api/user-queries';
import { voiceQueries } from '@/entities/voice/api/voice-queries';
import { VoiceParticipantCard } from '@/entities/voice/ui/voice-participant-card';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';
import { VoiceControls } from '@/features/voice-session/ui/voice-controls';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { ErrorState } from '@/shared/ui/error-state';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';

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

export function VoiceStage({ channelId, className }: VoiceStageProps) {
  const session = useVoiceSession();
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isCurrentChannel = session.channelId === channelId;
  const isConnected = isCurrentChannel && session.status === 'connected';
  const isConnecting = isCurrentChannel && session.status === 'connecting';
  const isBusyElsewhere = session.channelId !== null && !isCurrentChannel;

  const preview = useQuery({
    ...voiceQueries.participants(channelId),
    enabled: !isConnected,
  });

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
      stage
        .map((participant) => participant.userId)
        .filter((id) => id !== null),
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

  const showPreviewPending = !isConnected && preview.isPending;
  const showPreviewError = !isConnected && preview.isError;

  async function run(action: () => Promise<void>) {
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

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', className)}>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6">
        {showPreviewPending && (
          <ul className="flex w-225 max-w-full flex-wrap items-center justify-center gap-5">
            {Array.from({ length: 3 }, (_, index) => (
              <li key={index}>
                <span className="block h-49 w-70 animate-pulse rounded-2xl bg-surface-container" />
              </li>
            ))}
          </ul>
        )}

        {showPreviewError && (
          <ErrorState
            title="참여자를 불러오지 못했습니다"
            description="잠시 후 다시 시도해 주세요"
            action={
              <Button size="S" variant="weak" onClick={() => preview.refetch()}>
                다시 시도
              </Button>
            }
          />
        )}

        {!showPreviewPending && !showPreviewError && stage.length === 0 && (
          <EmptyState
            icon={<HeadphonesIcon />}
            title="아직 참여자가 없습니다"
            description="가장 먼저 입장해 대화를 시작하세요"
            className="max-w-md"
          />
        )}

        {!showPreviewPending && !showPreviewError && stage.length > 0 && (
          <ul className="flex w-225 max-w-full flex-wrap items-center justify-center gap-5">
            {stage.map((participant) => (
              <li key={participant.key}>
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
                />
              </li>
            ))}
          </ul>
        )}
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

        {isConnected ? (
          <VoiceControls
            micEnabled={session.micEnabled}
            onToggleMic={() => void run(session.toggleMic)}
            audioEnabled={session.audioEnabled}
            onToggleAudio={session.toggleAudio}
            onLeave={() => void run(session.leave)}
          />
        ) : (
          <Button
            onClick={() => void run(() => session.join(channelId))}
            disabled={pending || isConnecting}
          >
            {isConnecting ? '연결 중…' : '음성 채널 참여'}
          </Button>
        )}
      </div>
    </div>
  );
}
