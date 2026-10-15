import { type Channel } from '@/entities/channel/model/channel';

export interface ChannelGroup {
  projectId: number | null;
  channels: Channel[];
}

export function groupChannelsByProject(channels: Channel[]): ChannelGroup[] {
  const groups = new Map<number | null, Channel[]>();

  for (const channel of channels) {
    const key = channel.projectId ?? null;
    const bucket = groups.get(key);

    if (bucket) {
      bucket.push(channel);
    } else {
      groups.set(key, [channel]);
    }
  }

  return [...groups.entries()]
    .map(([projectId, grouped]) => ({
      projectId,
      channels: [...grouped].sort((a, b) => a.position - b.position),
    }))
    .sort((a, b) => {
      if (a.projectId === null) return 1;
      if (b.projectId === null) return -1;

      return a.projectId - b.projectId;
    });
}
