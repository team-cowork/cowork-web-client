export const HOME_PATH = '/';
// 로그인하지 않은 사용자의 홈(/)을 그리는 내부 경로. 이 주소로 직접 들어오면 홈으로 돌려보낸다.
export const PROMOTION_PATH = '/promotion';
export const SIGNIN_PATH = '/signin';

export function teamPath(teamId: number): string {
  return `/teams/${teamId}`;
}

export function channelPath(teamId: number, channelId: number): string {
  return `/teams/${teamId}/channels/${channelId}`;
}

export function projectPath(teamId: number, projectId: number): string {
  return `/teams/${teamId}/projects/${projectId}`;
}

export function dmPath(channelId: number): string {
  return `/dms/${channelId}`;
}

export function teamSettingsProfilePath(teamId: number): string {
  return `/teams/${teamId}/settings/profile`;
}

export function teamSettingsInvitesPath(teamId: number): string {
  return `/teams/${teamId}/settings/invites`;
}

export function teamSettingsMembersPath(teamId: number): string {
  return `/teams/${teamId}/settings/members`;
}

export function teamSettingsRolesPath(teamId: number): string {
  return `/teams/${teamId}/settings/roles`;
}

export function teamSettingsRoleDetailPath(
  teamId: number,
  roleId: number,
): string {
  return `/teams/${teamId}/settings/roles/${roleId}`;
}

export function channelSettingsOverviewPath(
  teamId: number,
  channelId: number,
): string {
  return `/teams/${teamId}/channels/${channelId}/settings/overview`;
}

export function channelSettingsPermissionsPath(
  teamId: number,
  channelId: number,
): string {
  return `/teams/${teamId}/channels/${channelId}/settings/permissions`;
}

export function channelSettingsWebhooksPath(
  teamId: number,
  channelId: number,
): string {
  return `/teams/${teamId}/channels/${channelId}/settings/webhooks`;
}

export function teamSettingsGithubPath(teamId: number): string {
  return `/teams/${teamId}/settings/github`;
}
