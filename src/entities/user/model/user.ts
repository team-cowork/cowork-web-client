export const USER_STATUSES = ['ONLINE', 'AWAY', 'DO_NOT_DISTURB', 'OFFLINE'] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ONLINE: '온라인',
  AWAY: '자리 비움',
  DO_NOT_DISTURB: '방해 금지',
  OFFLINE: '오프라인',
};

export const USER_STATUS_DOT_CLASS: Record<UserStatus, string> = {
  ONLINE: 'bg-success',
  AWAY: 'bg-cowork-amber-500',
  DO_NOT_DISTURB: 'bg-primary',
  OFFLINE: 'bg-cowork-neutral-300',
};

export function toUserStatus(status: string): UserStatus {
  return USER_STATUSES.find((candidate) => candidate === status) ?? 'ONLINE';
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
