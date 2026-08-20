'use client';

import { useQuery } from '@tanstack/react-query';

import { voiceQueries } from '@/entities/voice/api/voice-queries';
import { useVoiceSession } from '@/features/voice-session/model/voice-session-provider';
import { cn } from '@/shared/lib/cn';
import { UsersIcon } from '@/shared/ui/icons/users-icon';

export interface VoiceParticipantBadgeProps {
  channelId: number;
  className?: string;
}

export function VoiceParticipantBadge({ channelId, className }: VoiceParticipantBadgeProps) {
  const session = useVoiceSession();
  const isConnected = session.channelId === channelId && session.status === 'connected';

  const { data } = useQuery({
    ...voiceQueries.participants(channelId),
    enabled: !isConnected,
  });

  const count = isConnected ? session.participants.length : data?.participants.length;

  if (count === undefined) return null;

  return (
    <span
      className={cn(
        'bg-surface-container flex shrink-0 items-center gap-[5px] rounded-md px-2 py-[3px]',
        className,
      )}
    >
      <UsersIcon size={14} className="text-on-surface-variant shrink-0" />
      <span className="typography-subtext-small text-on-surface-variant">{count}</span>
    </span>
  );
}
