import { type User } from '@/entities/user/model/user';
import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { MicIcon } from '@/shared/ui/icons/mic-icon';
import { MicOffIcon } from '@/shared/ui/icons/mic-off-icon';

export interface VoiceParticipantCardProps {
  user?: User;
  fallbackName?: string;
  speaking?: boolean;
  muted?: boolean;
  className?: string;
}

export function VoiceParticipantCard({
  user,
  fallbackName,
  speaking = false,
  muted = false,
  className,
}: VoiceParticipantCardProps) {
  const displayName = user?.nickname ?? user?.name ?? fallbackName ?? '알 수 없음';
  const MicStateIcon = muted ? MicOffIcon : MicIcon;

  return (
    <div
      className={cn(
        'bg-surface-container-low flex h-49 w-70 flex-col items-center justify-center gap-3.5 rounded-2xl pt-6 pb-5',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex rounded-full border-[3px] p-1',
          speaking ? 'border-cowork-green-500' : 'border-transparent',
        )}
      >
        <Avatar
          src={user?.profile_image_url ?? undefined}
          name={user?.name ?? fallbackName}
          size={80}
          shape="circle"
        />
      </span>

      <span className="flex items-center gap-1.5">
        <MicStateIcon
          size={16}
          aria-label={muted ? '마이크 꺼짐' : '마이크 켜짐'}
          className={cn('shrink-0', muted ? 'text-primary' : 'text-on-surface-variant')}
        />
        <span className="typography-label-small text-on-surface truncate">{displayName}</span>
      </span>
    </div>
  );
}
