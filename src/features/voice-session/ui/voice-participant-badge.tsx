'use client';

import { useVoiceChannelParticipants } from '@/features/voice-session/model/use-voice-channel-participants';
import { cn } from '@/shared/lib/cn';
import { UsersIcon } from '@/shared/ui/icons/users-icon';

export interface VoiceParticipantBadgeProps {
  channelId: number;
  className?: string;
}

export function VoiceParticipantBadge({
  channelId,
  className,
}: VoiceParticipantBadgeProps) {
  const { participants } = useVoiceChannelParticipants(channelId);
  const count = participants?.length;

  if (count === undefined) return null;

  return (
    <span
      className={cn(
        'flex shrink-0 items-center gap-[5px] rounded-md bg-surface-container px-2 py-[3px]',
        className,
      )}
    >
      <UsersIcon size={14} className="shrink-0 text-on-surface-variant" />
      <span className="typography-subtext-small text-on-surface-variant">
        {count}
      </span>
    </span>
  );
}
