import {
  type ProfileBannerColor,
  toProfileBannerColor,
} from '@/entities/user/model/profile-banner';
import { cn } from '@/shared/lib/cn';

const DEFAULT_BANNER_CLASS = 'from-cowork-red-500 to-cowork-blue-500';

const PROFILE_BANNER_CLASS: Record<ProfileBannerColor, string> = {
  RED: 'from-cowork-red-400 to-cowork-red-600',
  BLUE: 'from-cowork-blue-400 to-cowork-blue-600',
  GREEN: 'from-cowork-green-400 to-cowork-green-600',
  AMBER: 'from-cowork-amber-400 to-cowork-amber-600',
  NEUTRAL: 'from-cowork-neutral-500 to-cowork-neutral-700',
};

export interface ProfileBannerProps {
  /** 서버의 `banner_color`. 없거나 모르는 값이면 기본 배경을 쓴다. */
  color?: string | null;
  className?: string;
}

/** 프로필 카드 위쪽 배경 */
export function ProfileBanner({ color, className }: ProfileBannerProps) {
  return (
    <div
      className={cn(profileBannerClass(toProfileBannerColor(color)), className)}
    />
  );
}

/** 색상 선택지에서 쓰는 배경 클래스. `null`이면 기본 배경이다. */
export function profileBannerClass(color: ProfileBannerColor | null): string {
  return cn(
    'bg-gradient-to-r',
    color ? PROFILE_BANNER_CLASS[color] : DEFAULT_BANNER_CLASS,
  );
}
