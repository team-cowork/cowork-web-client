import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LastChannelState {
  channelIdByTeam: Record<number, number>;
  setLastChannelId: (teamId: number, channelId: number) => void;
  clearLastChannelId: (teamId: number, channelId: number) => void;
}

export const useLastChannelStore = create<LastChannelState>()(
  persist(
    (set) => ({
      channelIdByTeam: {},
      setLastChannelId: (teamId, channelId) =>
        set((state) => ({
          channelIdByTeam: { ...state.channelIdByTeam, [teamId]: channelId },
        })),
      clearLastChannelId: (teamId, channelId) =>
        set((state) => {
          if (state.channelIdByTeam[teamId] !== channelId) return state;

          const channelIdByTeam = { ...state.channelIdByTeam };
          delete channelIdByTeam[teamId];

          return { channelIdByTeam };
        }),
    }),
    {
      name: 'cowork:last-channel',
      partialize: ({ channelIdByTeam }) => ({ channelIdByTeam }),
    },
  ),
);
