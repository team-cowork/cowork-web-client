import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Channel } from '@/entities/channel/model/channel';

interface LastChannelState {
  channelIdByTeam: Record<number, number>;
  setLastChannelId: (teamId: number, channelId: number) => void;
}

export const useLastChannelStore = create<LastChannelState>()(
  persist(
    (set) => ({
      channelIdByTeam: {},
      setLastChannelId: (teamId, channelId) =>
        set((state) => ({
          channelIdByTeam: { ...state.channelIdByTeam, [teamId]: channelId },
        })),
    }),
    {
      name: 'cowork:last-channel',
      partialize: ({ channelIdByTeam }) => ({ channelIdByTeam }),
    },
  ),
);

export function resolveEntryChannelId(
  lastChannelId: number | undefined,
  channels: Channel[],
): number | null {
  if (channels.some((channel) => channel.id === lastChannelId)) {
    return lastChannelId ?? null;
  }

  return (
    channels.reduce<Channel | null>(
      (first, channel) =>
        first === null || channel.position < first.position ? channel : first,
      null,
    )?.id ?? null
  );
}
