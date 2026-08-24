export const TEAM_MEMBER_ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;

export type TeamMemberRole = (typeof TEAM_MEMBER_ROLES)[number];

export type AssignableTeamMemberRole = Exclude<TeamMemberRole, 'OWNER'>;

export const TEAM_MEMBER_ROLE_LABEL: Record<TeamMemberRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '멤버',
};

export function toTeamMemberRole(role: string): TeamMemberRole | null {
  return TEAM_MEMBER_ROLES.find((candidate) => candidate === role) ?? null;
}

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
  myRole: string;
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
  permissions: string[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface TeamMember {
  id: number;
  userId: number;
  role: string;
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

export interface ChangeMemberRoleRequest {
  role: AssignableTeamMemberRole;
}

export interface CreateTeamRoleRequest {
  name: string;
  colorHex: string;
  priority: number;
  mentionable: boolean;
  permissions: string[];
}

export interface UpdateTeamRoleRequest {
  name?: string | null;
  colorHex?: string | null;
  priority?: number | null;
  mentionable?: boolean | null;
  permissions?: string[] | null;
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
