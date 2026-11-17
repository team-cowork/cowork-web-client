export const HOME_PATH = '/';

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
