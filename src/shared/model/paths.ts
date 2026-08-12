export const HOME_PATH = '/';

export function teamPath(teamId: number): string {
  return `/teams/${teamId}`;
}

export function channelPath(teamId: number, channelId: number): string {
  return `/teams/${teamId}/channels/${channelId}`;
}
