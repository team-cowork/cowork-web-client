'use client';

import { cn } from '@/shared/lib/cn';
import { type CameraControl } from '@/shared/model/camera-control';
import { CameraIcon } from '@/shared/ui/icons/camera-icon';
import { CameraOffIcon } from '@/shared/ui/icons/camera-off-icon';
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
  /** 없으면 카메라 버튼을 그리지 않는다 */
  camera?: CameraControl;
  onShareScreen?: () => void;
  screenSharing?: boolean;
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
  camera,
  onShareScreen,
  screenSharing = false,
  onLeave,
  className,
}: VoiceControlsProps) {
  const MicStateIcon = micEnabled ? MicIcon : MicOffIcon;

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-3 rounded-full bg-surface px-4 py-3',
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

      {camera && (
        <button
          type="button"
          aria-label={
            camera.unavailable
              ? '카메라 권한 없음'
              : camera.enabled
                ? '카메라 끄기'
                : '카메라 켜기'
          }
          aria-pressed={camera.enabled}
          aria-disabled={camera.unavailable}
          onClick={camera.onToggle}
          disabled={!camera.onToggle}
          className={cn(
            buttonClass,
            camera.enabled
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
            camera.unavailable && 'opacity-50',
          )}
        >
          {camera.enabled ? (
            <CameraIcon size={22} />
          ) : (
            <CameraOffIcon size={22} />
          )}
        </button>
      )}

      <button
        type="button"
        aria-label={screenSharing ? '화면 공유 중지' : '화면 공유'}
        aria-pressed={screenSharing}
        onClick={onShareScreen}
        disabled={!onShareScreen}
        className={cn(
          buttonClass,
          screenSharing
            ? 'bg-primary text-on-primary'
            : 'bg-surface-container text-on-surface hover:bg-surface-container-high',
        )}
      >
        <MonitorIcon size={22} />
      </button>

      <button
        type="button"
        aria-label="음성 채널 나가기"
        onClick={onLeave}
        disabled={!onLeave}
        className={cn(
          buttonClass,
          'bg-error text-on-error hover:bg-cowork-red-800',
        )}
      >
        <PhoneIcon size={22} />
      </button>
    </div>
  );
}
