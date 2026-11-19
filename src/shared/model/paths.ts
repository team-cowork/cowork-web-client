export const HOME_PATH = '/';
// 로그인하지 않은 사용자의 홈(/)을 그리는 내부 경로. 이 주소로 직접 들어오면 홈으로 돌려보낸다.
export const PROMOTION_PATH = '/promotion';
export const SIGNIN_PATH = '/signin';

// 로그인 없이 볼 수 있는 소개용 문서
export const PRIVACY_PATH = '/privacy';
export const TERMS_PATH = '/terms';
export const LICENSE_PATH = '/license';

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

// TODO(임시): 발표용 임시 칸반 경로. 칸반을 지울 때 같이 지운다.
export function issuesPath(teamId: number): string {
  return `/teams/${teamId}/issues`;
}

// TODO(임시): 발표용으로 사이드바에서 바로 여는 PR 보드 경로. 칸반을 지울 때 같이 지운다.
export function pullsPath(teamId: number): string {
  return `/teams/${teamId}/pulls`;
}

export function meetingNoteNewPath(teamId: number, channelId: number): string {
  return `${channelPath(teamId, channelId)}/meeting-notes/new`;
}

export function meetingNoteEditPath(
  teamId: number,
  channelId: number,
  noteId: number,
): string {
  return `${channelPath(teamId, channelId)}/meeting-notes/${noteId}/edit`;
}

/** 회의록 채널에서 특정 회의록을 연 화면 */
export function meetingNoteViewPath(
  teamId: number,
  channelId: number,
  noteId: number,
): string {
  return `${channelPath(teamId, channelId)}?note=${noteId}`;
}

export function meetingNoteTemplatesPath(
  teamId: number,
  channelId: number,
): string {
  return `${channelPath(teamId, channelId)}/meeting-note-templates`;
}

export function meetingNoteTemplateNewPath(
  teamId: number,
  channelId: number,
): string {
  return `${meetingNoteTemplatesPath(teamId, channelId)}/new`;
}

export function meetingNoteTemplateEditPath(
  teamId: number,
  channelId: number,
  templateId: number,
): string {
  return `${meetingNoteTemplatesPath(teamId, channelId)}/${templateId}`;
}
