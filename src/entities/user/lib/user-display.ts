import { type User } from '@/entities/user/model/user';

export function userDisplayName(
  userId: number,
  user: User | undefined,
): string {
  if (user) return user.nickname ?? user.name;
  return `사용자 #${userId}`;
}

// 별명이 없으면 이름을, 사용자 정보를 아직 모르면 fallback을 보여 준다
export function getUserDisplayName(
  user: User | undefined,
  fallback: string,
): string {
  return user?.nickname ?? user?.name ?? fallback;
}

export function matchesUserKeyword(
  userId: number,
  user: User | undefined,
  keyword: string,
): boolean {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return true;

  const targets = user
    ? [user.nickname, user.name]
    : [userDisplayName(userId, user)];

  return targets.some((target) => target?.toLowerCase().includes(normalized));
}
