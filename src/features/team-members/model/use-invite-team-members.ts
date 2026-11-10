'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { postTeamMembers } from '@/entities/team/api/post-team-members';
import { teamQueries } from '@/entities/team/api/team-queries';

const CHANNEL_MEMBERS_RETRY_DELAY = 2000;

export function useInviteTeamMembers(teamId: number) {
  const queryClient = useQueryClient();

  const addToPublicChannels = (userIds: number[]) => {
    const channels =
      queryClient.getQueryData(channelQueries.byTeam(teamId).queryKey) ?? [];
    const joinedAt = new Date().toISOString();

    channels
      .filter((channel) => !channel.isPrivate)
      .forEach(({ id: channelId }) => {
        queryClient.setQueryData(
          channelQueries.members(channelId).queryKey,
          (members) =>
            members &&
            [
              ...members,
              ...userIds
                .filter(
                  (userId) =>
                    !members.some((member) => member.userId === userId),
                )
                .map((userId) => ({
                  id: -userId,
                  channelId,
                  userId,
                  joinedAt,
                })),
            ].sort((a, b) => a.userId - b.userId),
        );
      });
  };

  return useMutation({
    mutationFn: (userIds: number[]) => postTeamMembers(teamId, { userIds }),
    onSuccess: (_, userIds) => {
      addToPublicChannels(userIds);
      setTimeout(
        () =>
          queryClient.invalidateQueries({
            queryKey: [...channelQueries.all(), 'members'],
          }),
        CHANNEL_MEMBERS_RETRY_DELAY,
      );

      return queryClient.invalidateQueries({
        queryKey: teamQueries.members(teamId).queryKey,
      });
    },
  });
}
