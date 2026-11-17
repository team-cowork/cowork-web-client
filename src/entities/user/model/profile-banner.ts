import { type User } from '@/entities/user/model/user';

/** 서버에 저장하는 프로필 배경 프리셋 키. 실제 색은 클라이언트가 정한다. */
export const PROFILE_BANNER_COLORS = [
  'RED',
  'BLUE',
  'GREEN',
  'AMBER',
  'NEUTRAL',
] as const;

export type ProfileBannerColor = (typeof PROFILE_BANNER_COLORS)[number];

export const PROFILE_BANNER_LABEL: Record<ProfileBannerColor, string> = {
  RED: '빨강',
  BLUE: '파랑',
  GREEN: '초록',
  AMBER: '노랑',
  NEUTRAL: '회색',
};

/** 고르지 않았거나 모르는 값이면 `null`(기본 배경)로 본다. */
export function toProfileBannerColor(
  value: string | null | undefined,
): ProfileBannerColor | null {
  return PROFILE_BANNER_COLORS.find((color) => color === value) ?? null;
}

/**
 * 서버가 배경 색상을 지원하는지. 지원하면 사용자 응답에 `banner_color` 키가 항상 들어 있다(고르지 않았으면 null).
 * 지원 전에는 저장해도 서버가 값을 버리므로 색상 선택을 보여 주지 않는다.
 */
export function supportsProfileBanner(user: User): boolean {
  return 'banner_color' in user;
}
