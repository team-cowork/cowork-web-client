'use client';

import { useQueries, useQuery } from '@tanstack/react-query';

import { liveQueries } from '@/entities/live/api/live-queries';
import { userQueries } from '@/entities/user/api/user-queries';
import { getUserDisplayName } from '@/entities/user/lib/user-display';
import { useVoiceChannelParticipants } from '@/features/voice-session/model/use-voice-channel-participants';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { MicOffIcon } from '@/shared/ui/icons/mic-off-icon';

export interface VoiceChannelMembersProps {
  channelId: number;
  className?: string;
}

// 음성 채널마다 따로 조회하므로 열어 둔 채널(15초)보다 느리게 갱신한다.
// 창으로 돌아올 때는 바로 다시 받아 오래 머물러도 크게 어긋나지 않는다
const SIDEBAR_REFETCH_INTERVAL_MS = 60 * 1000;

export function VoiceChannelMembers({
  channelId,
  className,
}: VoiceChannelMembersProps) {
  const { participants } = useVoiceChannelParticipants(channelId, {
    refetchInterval: SIDEBAR_REFETCH_INTERVAL_MS,
  });
  const members = participants ?? [];

  // 빈 채널까지 방송 상태를 주기적으로 조회하지 않도록 참여자가 있을 때만 묻는다
  const { data: liveStatus } = useQuery({
    ...liveQueries.status(channelId),
    enabled: members.length > 0,
    refetchInterval: SIDEBAR_REFETCH_INTERVAL_MS,
  });

  const users = useQueries({
    queries: members
      .flatMap((member) => (member.userId === null ? [] : [member.userId]))
      .map((userId) => userQueries.detail(userId)),
  });
  const userById = new Map(
    users.flatMap((result) =>
      result.data ? [[result.data.id, result.data]] : [],
    ),
  );

  if (members.length === 0) return null;

  const liveHostUserId = liveStatus?.live ? liveStatus.host_user_id : undefined;

  return (
    <ul className={cn('flex flex-col gap-0.5 pt-0.5 pb-1 pl-10', className)}>
      {members.map((member) => {
        const user =
          member.userId === null ? undefined : userById.get(member.userId);
        const name = getUserDisplayName(
          user,
          `#${member.userId ?? member.key}`,
        );

        return (
          <li
            key={member.key}
            title={name}
            className="flex h-8 items-center gap-2 rounded-lg pr-2 pl-1 text-on-surface-variant transition-colors hover:bg-surface-container/60 hover:text-on-surface"
          >
            <span
              className={cn(
                'inline-flex shrink-0 rounded-full border-2',
                member.speaking
                  ? 'border-cowork-green-500'
                  : 'border-transparent',
              )}
            >
              <Avatar
                src={user?.profile_image_url ?? undefined}
                name={user?.name ?? name}
                size={22}
                shape="circle"
              />
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 truncate typography-subtext-medium',
                member.speaking && 'text-on-surface',
              )}
            >
              {name}
            </span>
            {member.userId !== null && member.userId === liveHostUserId && (
              <span className="shrink-0 rounded bg-error px-1 text-[0.625rem] leading-4 font-bold text-on-error">
                LIVE
              </span>
            )}
            {member.muted && (
              <MicOffIcon
                size={14}
                aria-label="마이크 꺼짐"
                className="shrink-0"
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}
