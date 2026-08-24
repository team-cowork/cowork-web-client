'use client';

import { cn } from '@/shared/lib/cn';
import { HeadphonesIcon } from '@/shared/ui/icons/headphones-icon';
import { MicIcon } from '@/shared/ui/icons/mic-icon';
import { MicOffIcon } from '@/shared/ui/icons/mic-off-icon';
import { MonitorIcon } from '@/shared/ui/icons/monitor-icon';
import { PhoneIcon } from '@/shared/ui/icons/phone-icon';

export interface VoiceControlsProps {
  micEnabled: boolean;
  onToggleMic: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onShareScreen?: () => void;
  onLeave?: () => void;
  className?: string;
}

const buttonClass =
  'flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export function VoiceControls({
  micEnabled,
  onToggleMic,
  audioEnabled,
  onToggleAudio,
  onShareScreen,
  onLeave,
  className,
}: VoiceControlsProps) {
  const MicStateIcon = micEnabled ? MicIcon : MicOffIcon;

  return (
    <div
      className={cn(
        'bg-surface flex items-center justify-center gap-3 rounded-full px-4 py-3',
        className,
      )}
    >
      <button
        type="button"
        aria-label={micEnabled ? '마이크 끄기' : '마이크 켜기'}
        aria-pressed={!micEnabled}
        onClick={onToggleMic}
        className={cn(
          buttonClass,
          micEnabled
            ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            : 'bg-error text-on-error',
        )}
      >
        <MicStateIcon size={22} />
      </button>

      <button
        type="button"
        aria-label={audioEnabled ? '스피커 끄기' : '스피커 켜기'}
        aria-pressed={!audioEnabled}
        onClick={onToggleAudio}
        className={cn(
          buttonClass,
          audioEnabled
            ? 'bg-surface-container text-on-surface hover:bg-surface-container-high'
            : 'bg-error text-on-error',
        )}
      >
        <HeadphonesIcon size={22} />
      </button>

      <button
        type="button"
        aria-label="화면 공유"
        onClick={onShareScreen}
        disabled={!onShareScreen}
        className={cn(buttonClass, 'bg-surface-container text-on-surface-variant')}
      >
        <MonitorIcon size={22} />
      </button>

      <button
        type="button"
        aria-label="음성 채널 나가기"
        onClick={onLeave}
        disabled={!onLeave}
        className={cn(buttonClass, 'bg-error text-on-error hover:bg-cowork-red-800')}
      >
        <PhoneIcon size={22} />
      </button>
    </div>
  );
}
