export const USER_STATUSES = [
  'online',
  'away',
  'do_not_disturb',
  'offline',
] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  online: '온라인',
  away: '자리 비움',
  do_not_disturb: '방해 금지',
  offline: '오프라인',
};

export const USER_STATUS_DOT_CLASS: Record<UserStatus, string> = {
  online: 'bg-success',
  away: 'bg-cowork-amber-500',
  do_not_disturb: 'bg-primary',
  offline: 'bg-cowork-neutral-300',
};

/** 서버가 내려주는 접속 여부 */
export type UserPresence = 'online' | 'offline';

export function toUserStatus(
  status: string | null | undefined,
): UserStatus | null {
  const normalized = status?.toLowerCase();

  return USER_STATUSES.find((candidate) => candidate === normalized) ?? null;
}

/** 서버 `custom_status` 값 형식(예: `DO_NOT_DISTURB`)으로 바꾼다. */
export function toCustomStatus(status: UserStatus): string {
  return status.toUpperCase();
}

/** 접속 여부(`status`)와 사용자가 고른 상태(`custom_status`)를 합쳐 화면에 보일 상태를 정한다. */
export function resolveUserStatus(
  user: Pick<User, 'status' | 'custom_status'>,
): UserStatus | null {
  const presence = toUserStatus(user.status);
  if (presence === 'offline') return 'offline';

  return toUserStatus(user.custom_status) ?? presence;
}

export interface User {
  id: number;
  name: string;
  email: string;
  sex: string;
  status: UserPresence;
  custom_status: string | null;
  roles: string[];
  major: string | null;
  description: string | null;
  nickname: string | null;
  specialty: string | null;
  status_expires_at: string | null;
  status_message: string | null;
  student_number: string | null;
  student_role: string | null;
  account_description: string | null;
  github_id: string | null;
  profile_image_url: string | null;
  /**
   * 프로필 배경 프리셋 키(`PROFILE_BANNER_COLORS`). 고르지 않았으면 null이다.
   * 서버가 지원하기 전에는 키 자체가 없다.
   */
  banner_color?: string | null;
}

export interface SearchUsersParams {
  name?: string;
  nickname?: string;
  major?: string;
  student_role?: string;
  status?: UserPresence;
  custom_status?: string;
  role?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UserSearchResult {
  items: User[];
  page: number;
  page_size: number;
  total_count: number;
  has_next: boolean;
}

export interface UpdateMeRequest {
  name?: string;
  description?: string;
  nickname?: string;
  github_id?: string | null;
  roles?: string[];
  /** null이면 기본 배경으로 되돌린다 */
  banner_color?: string | null;
}

export interface UpdateMyStatusRequest {
  custom_status: string;
  message?: string | null;
  expiresAt?: string | null;
}

export interface ProfileImagePresignedResponse {
  object_key: string;
  upload_url: string;
}
