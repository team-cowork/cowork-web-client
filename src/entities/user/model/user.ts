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

export function toUserStatus(status: string): UserStatus | null {
  return USER_STATUSES.find((candidate) => candidate === status) ?? null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  sex: string;
  status: string;
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
}

export interface SearchUsersParams {
  name?: string;
  nickname?: string;
  major?: string;
  student_role?: string;
  status?: UserStatus;
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
}

export interface UpdateMyStatusRequest {
  status: UserStatus;
  message?: string | null;
  expiresAt?: string | null;
}

export interface ProfileImagePresignedResponse {
  object_key: string;
  upload_url: string;
}
