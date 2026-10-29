'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { channelQueries } from '@/entities/channel/api/channel-queries';
import { type ChannelMember } from '@/entities/channel/model/channel';
import { deleteTeamMember } from '@/entities/team/api/delete-team-member';
import { teamQueries } from '@/entities/team/api/team-queries';

const CHANNEL_MEMBERS_RETRY_DELAY = 2000;

export function useRemoveTeamMember(teamId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: number) =>
      deleteTeamMember(teamId, targetUserId),
    onSuccess: (_, targetUserId) => {
      const channelMembersKey = [...channelQueries.all(), 'members'];

      queryClient.setQueriesData<ChannelMember[]>(
        { queryKey: channelMembersKey },
        (members) =>
          members?.filter((member) => member.userId !== targetUserId),
      );
      setTimeout(
        () => queryClient.invalidateQueries({ queryKey: channelMembersKey }),
        CHANNEL_MEMBERS_RETRY_DELAY,
      );

      return Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamQueries.members(teamId).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: teamQueries.list().queryKey,
        }),
      ]);
    },
  });
}
