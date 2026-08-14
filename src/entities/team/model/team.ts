export const TEAM_ROLES = ['OWNER', 'ADMIN', 'MEMBER'] as const;

export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: '소유자',
  ADMIN: '관리자',
  MEMBER: '멤버',
};

export function toTeamRole(role: string): TeamRole | null {
  return TEAM_ROLES.find((candidate) => candidate === role) ?? null;
}

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

export interface CreateTeamRequest {
  name: string;
  description?: string | null;
  iconUrl?: string | null;
}
