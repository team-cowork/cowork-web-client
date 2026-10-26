import { type Channel } from '@/entities/channel/model/channel';

function storageKey(teamId: number): string {
  return `cowork:last-channel:${teamId}`;
}

export function saveLastChannelId(teamId: number, channelId: number) {
  try {
    localStorage.setItem(storageKey(teamId), String(channelId));
  } catch {
    return;
  }
}

function loadLastChannelId(teamId: number): number | null {
  try {
    return Number(localStorage.getItem(storageKey(teamId)));
  } catch {
    return null;
  }
}

export function resolveEntryChannelId(
  teamId: number,
  channels: Channel[],
): number | null {
  const lastId = loadLastChannelId(teamId);

  if (channels.some((channel) => channel.id === lastId)) return lastId;

  return (
    channels.reduce<Channel | null>(
      (first, channel) =>
        first === null || channel.position < first.position ? channel : first,
      null,
    )?.id ?? null
  );
}
