export const DEFAULT_ROLE_COLOR_HEX = '#5865F2';

export const INVITE_DURATIONS = ['1d', '7d', '30d', 'never'] as const;

export type InviteDuration = (typeof INVITE_DURATIONS)[number];

export const INVITE_DURATION_LABEL: Record<InviteDuration, string> = {
  '1d': '1일',
  '7d': '7일',
  '30d': '30일',
  never: '만료 없음',
};

export interface TeamSummary {
  id: number;
  name: string;
  iconUrl: string | null;
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string | null;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamRole {
  id: number;
  teamId: number;
  name: string;
  colorHex: string;
  priority: number;
  mentionable: boolean;
  permissions: Record<string, boolean>;
  createdAt: string | null;
  updatedAt: string | null;
  /** 모든 멤버에게 자동 적용되는 기본 역할(@everyone). 직접 부여·회수·삭제할 수 없다 */
  isDefault: boolean;
}

export interface TeamRolePermission {
  key: string;
  title: string;
  description: string;
  channelTypes: string[];
}

export interface TeamRolePermissionGroup {
  key: string;
  title: string;
  permissions: TeamRolePermission[];
}

export interface TeamRolePermissionsParams {
  query?: string;
  channelType?: string;
}

export interface TeamMember {
  id: number;
  userId: number;
  roles: TeamRole[];
  joinedAt: string;
}

export interface Invite {
  inviteCode: string;
  teamId: number;
  createdBy: number;
  duration: string;
  expiresAt: string | null;
  expired: boolean;
  createdAt: string;
}

export interface JoinTeamResult {
  teamId: number;
  userId: number;
  role: string;
  joinedAt: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string | null;
  iconUrl?: string | null;
}

export interface UpdateTeamRequest {
  name?: string | null;
  description?: string | null;
  iconUrl?: string | null;
}

export interface InviteMembersRequest {
  userIds: number[];
}

export interface TransferTeamOwnershipRequest {
  targetUserId: number;
}

export interface CreateTeamRoleRequest {
  name: string;
  colorHex: string;
  priority: number;
  mentionable: boolean;
  permissions: Record<string, boolean>;
}

export interface TeamRoleOperation {
  operationId: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  role: TeamRole | null;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface UpdateTeamRoleRequest {
  name?: string | null;
  colorHex?: string | null;
  priority?: number | null;
  mentionable?: boolean | null;
  permissions?: Record<string, boolean> | null;
}

export interface CreateInviteRequest {
  duration: InviteDuration;
}

export interface TeamIconPresignedResponse {
  uploadUrl: string;
  objectKey: string;
}

export interface TeamIconConfirmResponse {
  iconUrl: string;
}

export interface UpdateTeamIconRequest {
  iconUrl: string;
}
