export const HOME_PATH = '/';

export function teamPath(teamId: number): string {
  return `/teams/${teamId}`;
}

export function channelPath(teamId: number, channelId: number): string {
  return `/teams/${teamId}/channels/${channelId}`;
}

export function dmPath(channelId: number): string {
  return `/dms/${channelId}`;
}

export function teamSettingsProfilePath(teamId: number): string {
  return `/teams/${teamId}/settings/profile`;
}
